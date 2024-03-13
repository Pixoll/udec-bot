import { ValuesOf } from '../util';
import { ColumnTypeMap, TableDescriptor } from './db';

export abstract class QueryBuilder<Table extends TableDescriptor> {
    protected readonly instruction: string;
    protected readonly table: Table;

    public constructor(instruction: string, table: Table) {
        this.instruction = instruction;
        this.table = table;
    }
}

export type TableColumnName<Table extends TableDescriptor> = Table['columns'][number]['name'];
export type TableColumnValueTypeFromName<Table extends TableDescriptor, Column extends TableColumnName<Table>> = ValuesOf<{
    [C in Table['columns'][number] as C['name'] extends Column ? C['type'] : never]: ColumnTypeMap[C['type']];
}>;

export enum FilterOperationType {
    OR = 'OR',
    AND = 'AND',
}

export type TableColumnSelector<Table extends TableDescriptor, Column extends TableColumnName<Table>> = {
    column: Column;
    operation: FilterOperationType; 
    isNull?: boolean;
    lessThan?: number;
    greaterThan?: number;
    lessThanOrEqualTo?: number;
    greaterThanOrEqualTo?: number;
} & ({
    equals: TableColumnValueTypeFromName<Table, Column>;
} | {
    notEquals: TableColumnValueTypeFromName<Table, Column>;
});

export class SelectQueryBuilder<
    Table extends TableDescriptor, 
    Columns extends TableColumnName<Table>
> extends QueryBuilder<Table> {
    private readonly columns: Set<TableColumnName<Table>>;
    private readonly selectors: Array<TableColumnSelector<Table, Columns>>;

    public constructor(table: Table) {
        super('SELECT', table);
        this.columns = new Set();
        this.selectors = [];
    }

    public select(columns: Columns[] = []): this {
        for (const column of columns) {
            this.columns.add(column);
        }
        return this;
    }

    public where<Column extends Columns>(selector: TableColumnSelector<Table, Column>): this {
        this.selectors.push(selector as unknown as TableColumnSelector<Table, Columns>);
        return this;
    }

    public override toString(): string {
        const columns = this.columns.size > 0 ? `(${[...this.columns].join(', ')})` : '*';
        const where = this.selectors.length > 0
            ? ' WHERE ' + this.selectors.map(s => {
                const isNull = s.isNull ? 'IS NULL' : '';
                const equality = 'equals' in s
                    ? `= ${parseQueryValue(s.equals)}`
                    : `!= ${parseQueryValue(s.notEquals)}`;
                const lessComp = s.lessThan ? `< ${s.lessThan}`
                    : s.lessThanOrEqualTo ? `<= ${s.lessThanOrEqualTo}`
                        : '';
                const greaterComp = s.greaterThan ? `> ${s.greaterThan}`
                    : s.greaterThanOrEqualTo ? `>= ${s.greaterThanOrEqualTo}`
                        : '';

                const filters = [isNull, equality, lessComp, greaterComp].filter(f => f);

                return `${s.column} (${filters.join(` ${s.operation} `)})`;
            })
            : '';
        return `${this.instruction} ${columns} FROM ${this.table.name}` + where;
    }
}

export class InsertQueryBuilder<Table extends TableDescriptor> extends QueryBuilder<Table> {
    public constructor(table: Table) {
        super('INSERT INTO', table);
    }
}

export class UpdateQueryBuilder <Table extends TableDescriptor> extends QueryBuilder<Table> {
    public constructor(table: Table) {
        super('UPDATE', table);
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
