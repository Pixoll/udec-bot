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
            ? 'WHERE ' + this.filters.map(s => {
                const isNull = s.isNull ? 'IS NULL' : null;
                const equality = s.equals ? `= ${parseQueryValue(s.equals)}`
                    : s.notEquals ? `!= ${parseQueryValue(s.notEquals)}`
                        : null;
                const lessComp = s.lessThan ? `< ${s.lessThan}`
                    : s.lessThanOrEqualTo ? `<= ${s.lessThanOrEqualTo}`
                        : null;
                const greaterComp = s.greaterThan ? `> ${s.greaterThan}`
                    : s.greaterThanOrEqualTo ? `>= ${s.greaterThanOrEqualTo}`
                        : null;

                const filters = [isNull, equality, lessComp, greaterComp].filter(f => f);
                if (filters.length === 0) {
                    throw new Error('Must specify at least one query filter.');
                }

                return `(${s.column} ${filters.join(` OR ${s.column} `)})`;
            }).join(' AND ')
            : '';
        return `${this.instruction} ${columns} FROM ${this.table.name} ${where};`.replace(/ ;$/, ';');
    }
}

type TableColumnValueTypesFromNames<
    Table extends TableDescriptor,
    Columns extends Array<TableColumnName<Table>>
> =  Columns extends [infer Column extends TableColumnName<Table>, ...infer Rest extends Array<TableColumnName<Table>>]
    ? [TableColumnValueTypeFromName<Table, Column>, ...TableColumnValueTypesFromNames<Table, Rest>]
    : [];

export class InsertQueryBuilder<
    Table extends TableDescriptor,
    Columns extends Array<TableColumnName<Table>> = Array<TableColumnName<Table>>
> extends QueryBuilder<Table> {
    private readonly cols: Set<Columns[number]>;
    private readonly vals: unknown[];

    public constructor(table: Table) {
        super('INSERT INTO', table);
        this.cols = new Set();
        this.vals = [];
    }

    public columns<Cols extends Array<TableColumnName<Table>>>(
        ...columns: Cols
    ): Pick<InsertQueryBuilder<Table, Cols>, 'values'> {
        for (const column of columns) {
            this.cols.add(column);
        }
        return this as unknown as InsertQueryBuilder<Table, Cols>;
    }

    public values(...values: TableColumnValueTypesFromNames<Table, Columns>): Pick<this, 'toString'> {
        this.vals.push(...values);
        return this;
    }

    public toString(): string {
        const columns = [...this.cols];
        const values = this.vals.map(parseQueryValue);

        if (columns.length === 0) {
            throw new Error('At least one column must be specified.');
        }
        if (columns.length !== values.length) {
            throw new Error('Amount of values must equal amount of columns.');
        }

        return `${this.instruction} ${this.table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
    }
}

export class UpdateQueryBuilder<Table extends TableDescriptor> extends QueryBuilder<Table> {
    public constructor(table: Table) {
        super('UPDATE', table);
    }

    public toString(): string {
        return '';
    }
}

function parseQueryValue(value: unknown): string {
    switch (typeof value) {
        case 'string':
            return `"${value.replace(/"/g, '\\"')}"`;
        case 'bigint':
            return value.toString().replace('n', '');
        default:
            return `${value}`;
    }
}
