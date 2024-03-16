import { ValuesOf } from '../util';
import { ColumnTypeMap, TableDescriptor } from './db';

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
    lessThan?: number;
    greaterThan?: number;
    lessThanOrEqualTo?: number;
    greaterThanOrEqualTo?: number;
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
            ? 'WHERE ' + parseFilters(this.filters)
            : '';
        return `${this.instruction} ${columns} FROM ${this.table.name} ${where};`.replace(/ ;$/, ';');
    }
}

export type TableColumnValuePairs<Table extends TableDescriptor> = {
    [Column in Table['columns'][number] as Column['nonNull'] extends true ? Column['name'] : never]:
    ColumnTypeMap[Column['type']];
} & {
        [Column in Table['columns'][number] as Column['nonNull'] extends true ? never : Column['name']]?:
        ColumnTypeMap[Column['type']];
    };

export class InsertQueryBuilder<Table extends TableDescriptor> extends QueryBuilder<Table> {
    private pairs: TableColumnValuePairs<Table> | null;

    public constructor(table: Table) {
        super('INSERT INTO', table);
        this.pairs = null;
    }

    public values(pairs: TableColumnValuePairs<Table>): QueryBuilder {
        this.pairs = pairs;
        return this;
    }

    public toString(): string {
        const pairs = Object.entries(this.pairs ?? {});
        if (pairs.length === 0) {
            throw new Error('At least one (column, value) pair must be specified.');
        }

        const columns = pairs.map(p => p[0]).join(', ');
        const values = pairs.map(p => parseQueryValue(p[1])).join(', ');

        return `${this.instruction} ${this.table.name} (${columns}) VALUES (${values});`;
    }
}

export class UpdateQueryBuilder<
    Table extends TableDescriptor,
    Columns extends TableColumnName<Table> = TableColumnName<Table>
> extends QueryBuilder<Table> {
    private pairs: TableColumnValuePairs<Table> | null;
    private readonly filters: Array<TableColumnSelector<Table, Columns>>;

    public constructor(table: Table) {
        super('UPDATE', table);
        this.pairs = null;
        this.filters = [];
    }

    public values(pairs: TableColumnValuePairs<Table>): Omit<this, 'values'> {
        this.pairs = pairs;
        return this;
    }

    public where<Column extends Columns>(filter: TableColumnSelector<Table, Column>): Omit<this, 'values'> {
        this.filters.push(filter as unknown as TableColumnSelector<Table, Columns>);
        return this;
    }

    public toString(): string {
        const pairs = Object.entries(this.pairs ?? {});
        if (pairs.length === 0) {
            throw new Error('At least one (column, value) pair must be specified.');
        }

        const set = pairs.map(([k, v]) => `${k} = ${parseQueryValue(v)}`).join(', ');
        const where = this.filters.length > 0
            ? 'WHERE ' + parseFilters(this.filters)
            : '';

        return `${this.instruction} ${this.table.name} SET ${set} ${where};`.replace(/ ;$/, ';');
    }
}

export function parseQueryValue(value: unknown): string {
    switch (typeof value) {
        case 'string':
            return `'${value.replace(/'/g, '\\\'')}'`;
        case 'bigint':
            return value.toString().replace('n', '');
        default:
            return `${value}`;
    }
}

function parseFilters<
    Table extends TableDescriptor,
    Columns extends TableColumnName<Table>
>(filters: Array<TableColumnSelector<Table, Columns>>): string {
    return filters.map(f => {
        const isNull = typeof f.isNull !== 'undefined'
            ? `IS${!f.isNull ? ' NOT' : ''} NULL`
            : null;
        const equality = f.equals ? `= ${parseQueryValue(f.equals)}`
            : f.notEquals ? `!= ${parseQueryValue(f.notEquals)}`
                : null;
        const lessComp = f.lessThan ? `< ${f.lessThan}`
            : f.lessThanOrEqualTo ? `<= ${f.lessThanOrEqualTo}`
                : null;
        const greaterComp = f.greaterThan ? `> ${f.greaterThan}`
            : f.greaterThanOrEqualTo ? `>= ${f.greaterThanOrEqualTo}`
                : null;

        const filters = [isNull, equality, lessComp, greaterComp].filter(f => f);
        if (filters.length === 0) {
            throw new Error('Must specify at least one query filter.');
        }

        return `(${f.column} ${filters.join(` OR ${f.column} `)})`;
    }).join(' AND ');
}
