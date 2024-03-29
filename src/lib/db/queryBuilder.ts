import { Partialize, ValuesOf } from '../util';
import { ColumnDescriptor, ColumnType, ColumnTypeMap, EnumColumnDescriptor, TableDescriptor } from './db';

export abstract class QueryBuilder<Table extends TableDescriptor = TableDescriptor> {
    protected readonly instruction: string;
    protected readonly table: Table;

    public constructor(instruction: string, table: Table) {
        this.instruction = instruction;
        this.table = table;
    }

    public abstract toString(): string;
}

export type ConstructableQueryBuilder = new (table: TableDescriptor) => QueryBuilder;

type TableColumnName<Table extends TableDescriptor> = Table['columns'][number]['name'];
type TableColumnValueTypeFromName<Table extends TableDescriptor, Column extends TableColumnName<Table>> = ValuesOf<{
    [C in Table['columns'][number] as C['name'] extends Column ? string : never]: ColumnTypeMap[C['type']];
}>;

export type TableColumnSelector<Table extends TableDescriptor, Column extends TableColumnName<Table>> = {
    column: Column;
    equals?: TableColumnValueTypeFromName<Table, Column>;
    notEquals?: TableColumnValueTypeFromName<Table, Column>;
    isNull?: boolean;
    lessThan?: TableColumnValueTypeFromName<Table, Column>;
    greaterThan?: TableColumnValueTypeFromName<Table, Column>;
    lessThanOrEqualTo?: TableColumnValueTypeFromName<Table, Column>;
    greaterThanOrEqualTo?: TableColumnValueTypeFromName<Table, Column>;
};

export class SelectQueryBuilder<
    Table extends TableDescriptor,
    Columns extends TableColumnName<Table> = TableColumnName<Table>
> extends QueryBuilder<Table> {
    private readonly columns: Set<TableColumnName<Table>>;
    private readonly filters: Array<TableColumnSelector<Table, Columns>>;

    public constructor(table: Table) {
        super('SELECT', table);
        this.columns = new Set();
        this.filters = [];
    }

    public select(...columns: Columns[]): this {
        for (const column of columns) {
            this.columns.add(column);
        }
        return this;
    }

    public where<Column extends Columns>(filter: TableColumnSelector<Table, Column>): this {
        this.filters.push(filter as unknown as TableColumnSelector<Table, Columns>);
        return this;
    }

    public toString(): string {
        const columns = this.columns.size > 0 ? [...this.columns].join(', ') : '*';
        const where = this.filters.length > 0
            ? 'WHERE ' + parseFilters(this.table, this.filters)
            : '';
        return `${this.instruction} ${columns} FROM ${this.table.name} ${where};`.replace(/ ;$/, ';');
    }
}

type ColumnValueType<Column extends ColumnDescriptor> = Column extends EnumColumnDescriptor
    ? Column['values'][number]
    : ColumnTypeMap[Column['type']];

type ColumnNameKey<Column extends ColumnDescriptor, OmitAutoInc extends boolean>
    = Column['autoIncrement'] extends true ? (
        OmitAutoInc extends true ? never : Column['name']
    )
    : Column['nonNull'] extends true ? Column['name']
    : never;

type TableNullableColumns<Table extends TableDescriptor> = keyof {
    [Column in Table['columns'][number] as Column['nonNull'] extends true ? never : Column['name']]: never;
};

export type TableColumnValuePairs<Table extends TableDescriptor, OmitAutoInc extends boolean> = Partialize<{
    [Column in Table['columns'][number] as ColumnNameKey<Column, OmitAutoInc>]: ColumnValueType<Column>;
// @ts-expect-error: this works
}, TableNullableColumns<Table>>;

export class InsertQueryBuilder<Table extends TableDescriptor> extends QueryBuilder<Table> {
    private pairs: TableColumnValuePairs<Table, true> | null;

    public constructor(table: Table) {
        super('INSERT INTO', table);
        this.pairs = null;
    }

    public values(pairs: TableColumnValuePairs<Table, true>): QueryBuilder {
        this.pairs = pairs;
        return this;
    }

    public toString(): string {
        const pairs = Object.entries(this.pairs ?? {});
        if (pairs.length === 0) {
            throw new Error('At least one (column, value) pair must be specified.');
        }

        const columns = pairs.map(([k]) => k).join(', ');
        const values = pairs.map(([k, v]) => {
            const { type } = this.table.columns.find(c => c.name === k) as ColumnDescriptor;
            return parseQueryValue(v, type);
        }).join(', ');

        return `${this.instruction} ${this.table.name} (${columns}) VALUES (${values});`;
    }
}

export class UpdateQueryBuilder<
    Table extends TableDescriptor,
    Columns extends TableColumnName<Table> = TableColumnName<Table>
> extends QueryBuilder<Table> {
    private pairs: TableColumnValuePairs<Table, true> | null;
    private readonly filters: Array<TableColumnSelector<Table, Columns>>;

    public constructor(table: Table) {
        super('UPDATE', table);
        this.pairs = null;
        this.filters = [];
    }

    public values(pairs: TableColumnValuePairs<Table, true>): this {
        this.pairs = pairs;
        return this;
    }

    public where<Column extends Columns>(filter: TableColumnSelector<Table, Column>): this {
        this.filters.push(filter as unknown as TableColumnSelector<Table, Columns>);
        return this;
    }

    public toString(): string {
        const pairs = Object.entries(this.pairs ?? {});
        if (pairs.length === 0) {
            throw new Error('At least one (column, value) pair must be specified.');
        }

        const set = pairs.map(([k, v]) => {
            const { type } = this.table.columns.find(c => c.name === k) as ColumnDescriptor;
            return `${k} = ${parseQueryValue(v, type)}`;
        }).join(', ');
        const where = this.filters.length > 0
            ? 'WHERE ' + parseFilters(this.table, this.filters)
            : '';

        return `${this.instruction} ${this.table.name} SET ${set} ${where};`.replace(/ ;$/, ';');
    }
}

export class DeleteQueryBuilder<
    Table extends TableDescriptor,
    Columns extends TableColumnName<Table> = TableColumnName<Table>
> extends QueryBuilder<Table> {
    private readonly filters: Array<TableColumnSelector<Table, Columns>>;

    public constructor(table: Table) {
        super('DELETE FROM', table);
        this.filters = [];
    }

    public where<Column extends Columns>(filter: TableColumnSelector<Table, Column>): this {
        this.filters.push(filter as unknown as TableColumnSelector<Table, Columns>);
        return this;
    }

    public toString(): string {
        if (this.filters.length === 0) {
            throw new Error('At least one filter must be specified.');
        }

        const where = parseFilters(this.table, this.filters);
        return `${this.instruction} ${this.table.name} WHERE ${where};`.replace(/ ;$/, ';');
    }
}

export function parseQueryValue(value: unknown, type?: ColumnType): string {
    switch (typeof value) {
        case 'string':
            return `'${value.replace(/'/g, '\\\'')}'`;
        case 'bigint':
            return value.toString().replace('n', '');
    }

    if (value instanceof Date) {
        const dateString = `'${value.toISOString().replace(/T|\.\d+Z$/g, ' ').trimEnd()}'`;
        if (type === ColumnType.Timestamp) return dateString;
        return dateString.split(' ')[0] + '\'';
    }

    return `${value}`;
}

function parseFilters<
    Table extends TableDescriptor,
    Columns extends TableColumnName<Table>
>(table: Table, filters: Array<TableColumnSelector<Table, Columns>>): string {
    return filters.map(f => {
        const { type } = table.columns.find(c => c.name === f.column) as ColumnDescriptor;
        const isNull = typeof f.isNull !== 'undefined'
            ? `IS${!f.isNull ? ' NOT' : ''} NULL`
            : null;
        const equality = f.equals ? `= ${parseQueryValue(f.equals, type)}`
            : f.notEquals ? `!= ${parseQueryValue(f.notEquals, type)}`
                : null;
        const lessComp = f.lessThan ? `< ${parseQueryValue(f.lessThan, type)}`
            : f.lessThanOrEqualTo ? `<= ${parseQueryValue(f.lessThanOrEqualTo, type)}`
                : null;
        const greaterComp = f.greaterThan ? `> ${parseQueryValue(f.greaterThan, type)}`
            : f.greaterThanOrEqualTo ? `>= ${parseQueryValue(f.greaterThanOrEqualTo, type)}`
                : null;

        const filters = [isNull, equality, lessComp, greaterComp].filter(f => f);
        if (filters.length === 0) {
            throw new Error('Must specify at least one query filter.');
        }

        return `(${f.column} ${filters.join(` OR ${f.column} `)})`;
    }).join(' AND ');
}
