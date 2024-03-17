import { Connection, ProcedureCallPacket, ResultSetHeader, RowDataPacket, createConnection } from 'mysql2/promise';
import { Logger } from '../logger';
import {
    ConstructableQueryBuilder,
    InsertQueryBuilder,
    QueryBuilder,
    SelectQueryBuilder,
    TableColumnValuePairs,
    UpdateQueryBuilder,
    parseQueryValue,
} from './queryBuilder';
import { ValuesOf, xor } from '../util';

export enum ColumnType {
    Bigint = 'BIGINT',
    Boolean = 'TINYINT(1)',
    Date = 'DATE',
    Enum = 'ENUM',
    Integer = 'INT',
    String = 'VARCHAR',
    Timestamp = 'TIMESTAMP',
}

export interface ColumnTypeMap {
    [ColumnType.Bigint]: number;
    [ColumnType.Boolean]: boolean;
    [ColumnType.Date]: Date;
    [ColumnType.Enum]: unknown;
    [ColumnType.Integer]: number;
    [ColumnType.String]: string;
    [ColumnType.Timestamp]: Date;
}

export type SizeLimitedColumnType = ColumnType.String;

export type ColumnDescriptor = {
    readonly name: string;
    readonly primaryKey?: boolean;
    readonly nonNull?: boolean;
    readonly unique?: boolean;
    readonly autoIncrement?: boolean;
} & ({
    readonly type: Exclude<ColumnType, SizeLimitedColumnType | ColumnType.Enum>;
} | {
    readonly type: SizeLimitedColumnType;
    readonly size: number;
} | {
    readonly type: ColumnType.Enum;
    readonly values: readonly unknown[];
});

export interface TableDescriptor {
    readonly name: string;
    readonly columns: readonly ColumnDescriptor[] | ColumnDescriptor[];
}

export type TablesArray = readonly TableDescriptor[] | TableDescriptor[];

export interface DatabaseOptions<Tables extends TablesArray> {
    readonly host?: string;
    readonly port?: number;
    readonly socketPath?: string;
    readonly username?: string;
    readonly password?: string;
    readonly name?: string;
    readonly tables: Tables;
}

export type QueryResult<T> = QueryResultOk<T> | QueryResultError;

interface QueryResultOk<T> {
    ok: true;
    result: T;
}

interface QueryResultError {
    ok: false;
    error: unknown;
}

type RawQueryResult =
    | readonly [readonly DescribeTableResult[]]
    | readonly ResultSetHeader[]
    | readonly RowDataPacket[]
    | ReadonlyArray<readonly RowDataPacket[]>
    | ProcedureCallPacket;

type RawColumnType = ValuesOf<{
    [T in ColumnType]: T extends SizeLimitedColumnType ? `${Lowercase<T>}(${number})`
    : T extends ColumnType.Enum ? `${Lowercase<T>}(${string})`
    : Lowercase<T>;
}>;

interface DescribeTableResult {
    readonly Field: string;
    readonly Type: RawColumnType;
    readonly Null: 'NO' | 'YES';
    readonly Key: 'PRI' | '';
    readonly Default: NonNullable<unknown> | null;
    readonly Extra: 'auto_increment' | '';
}

type TableNames<Tables extends TablesArray> = Tables[number]['name'];
type TableFromName<Tables extends TablesArray, Name extends TableNames<Tables>> = ValuesOf<{
    [Table in Tables[number]as Table['name'] extends Name ? string : never]: Table;
}> & TableDescriptor;

export class Database<Tables extends TablesArray> implements DatabaseOptions<Tables> {
    public declare readonly host: string;
    public declare readonly port: number;
    public declare readonly socketPath: string;
    public declare readonly username: string;
    public declare readonly password: string;
    public declare readonly name: string;
    public declare readonly tables: Tables;
    private declare connection: Connection;

    public constructor(options: DatabaseOptions<Tables>) {
        const { DB_HOST, DB_PORT, DB_SOCKET_PATH, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
        Object.assign<Database<Tables>, Omit<DatabaseOptions<Tables>, 'tables'>, Partial<DatabaseOptions<Tables>>>(this, {
            host: DB_HOST,
            port: DB_PORT ? +DB_PORT : -1,
            socketPath: DB_SOCKET_PATH,
            username: DB_USERNAME,
            password: DB_PASSWORD,
            name: DB_NAME,
        }, options);

        if (!this.tables) {
            throw new Error('DatabaseOptions.tables must be specified.');
        }
    }

    public async connect(): Promise<void> {
        Logger.info('Connecting to database...');

        this.connection = await createConnection({
            host: this.host,
            port: this.port,
            socketPath: this.socketPath,
            user: this.username,
            password: this.password,
        });
        Logger.info('Connected to database.');

        await this.setup();
    }

    public async disconnect(): Promise<void> {
        Logger.info('Disconnecting from database...');
        await this.connection.end();
        Logger.info('Disconnected from database.');
    }

    private async setup(): Promise<void> {
        Logger.info('Setting up database...');

        const r1 = await this.query(`CREATE DATABASE IF NOT EXISTS ${this.name};`);
        if (!r1) return;
        const r2 = await this.query(`USE ${this.name};`);
        if (!r2) return;

        for (const table of this.tables) {
            const exists = await this.checkTableExists(table.name);
            if (exists) {
                await this.applyTableStructure(table);
                continue;
            }

            const tableCreationQuery = this.getTableCreationQuery(table);
            const rt = await this.query(tableCreationQuery);
            if (!rt) return;
        }

        Logger.info('Database is ready.');
    }

    public async select<TableName extends TableNames<Tables>, Table extends TableFromName<Tables, TableName>>(
        tableName: TableName,
        builder?: (queryBuilder: SelectQueryBuilder<Table>) => QueryBuilder
    ): Promise<QueryResult<Array<TableColumnValuePairs<Table>>>> {
        const query = await this.queryFromBuilder<SelectQueryBuilder<Table>, [RowDataPacket[]]>(
            SelectQueryBuilder, tableName, builder
        );
        if (!query.ok) return query;
        return {
            ok: true,
            result: query.result[0] as Array<TableColumnValuePairs<Table>>,
        };
    }

    public async insert<TableName extends TableNames<Tables>, Table extends TableFromName<Tables, TableName>>(
        tableName: TableName,
        builder: (queryBuilder: InsertQueryBuilder<Table>) => QueryBuilder
    ): Promise<QueryResult<ResultSetHeader>> {
        const query = await this.queryFromBuilder<InsertQueryBuilder<Table>, ResultSetHeader[]>(
            InsertQueryBuilder, tableName, builder
        );
        if (!query.ok) return query;
        return {
            ok: true,
            result: query.result[0],
        };
    }

    public async update<TableName extends TableNames<Tables>, Table extends TableFromName<Tables, TableName>>(
        tableName: TableName,
        builder: (queryBuilder: UpdateQueryBuilder<Table>) => QueryBuilder
    ): Promise<unknown> {
        return await this.queryFromBuilder(UpdateQueryBuilder, tableName, builder);
    }

    public async query<Result extends RawQueryResult>(sql: string): Promise<QueryResult<Result>> {
        Logger.info('MySQL instruction:', sql);
        try {
            const result = await this.connection.query(sql) as unknown as Result;
            Logger.info('Result =>', result);
            return {
                ok: true,
                result,
            };
        } catch (error) {
            Logger.error(error);
            return {
                ok: false,
                error,
            };
        }
    }

    private async queryFromBuilder<Builder, Result extends RawQueryResult>(
        BuilderConstructor: ConstructableQueryBuilder,
        tableName: string,
        builderFn?: (queryBuilder: Builder) => QueryBuilder
    ): Promise<QueryResult<Result>> {
        const table = this.tables.find(t => t.name === tableName) as TableDescriptor;
        const sqlBuilder = new BuilderConstructor(table);
        builderFn?.(sqlBuilder as Builder);
        return await this.query(sqlBuilder.toString());
    }

    private async checkTableExists(name: string): Promise<boolean> {
        const query = await this.query(`SHOW TABLES LIKE "${name}";`);
        return !query.ok || (Array.isArray(query.result) && query.result[0].length > 0);
    }

    private async applyTableStructure(table: TableDescriptor): Promise<void> {
        const query = await this.query<[DescribeTableResult[]]>(`DESCRIBE ${table.name};`);
        if (!query.ok) return;
        const currentStructure = query.result[0];
        const isSameStructure = validateTableStructure(currentStructure, table.columns);
        if (isSameStructure) return;

        Logger.error('Non-matching structures:', table.columns, '=>', currentStructure);
    }

    private getTableCreationQuery(table: TableDescriptor): string {
        return `CREATE TABLE ${this.name}.${table.name} (`
            + table.columns.map(column =>
                `${column.name} ${column.type}`
                + ('size' in column ? `(${column.size})` : '')
                + ('values' in column ? `(${column.values.map(parseQueryValue).join(', ')})` : '')
                + (column.primaryKey ? ' PRIMARY KEY' : '')
                + (column.unique ? ' UNIQUE' : '')
                + (column.nonNull ? ' NOT NULL' : '')
                + (column.autoIncrement ? ' AUTO_INCREMENT' : '')
            ).join(', ')
            + ');';
    }
}

function validateTableStructure(
    currentColumns: readonly DescribeTableResult[],
    columnsToMatch: readonly ColumnDescriptor[]
): boolean {
    if (currentColumns.length !== columnsToMatch.length) return false;

    const namesUnion = new Set([...currentColumns.map(c => c.Field), ...columnsToMatch.map(c => c.name)]);
    if (namesUnion.size !== columnsToMatch.length) return false;

    for (const column of columnsToMatch) {
        const currentColumn = currentColumns.find(c => c.Field === column.name);
        if (!currentColumn) return false;

        if (currentColumn.Default !== null) return false;
        if (xor(!!column.autoIncrement, currentColumn.Extra === 'auto_increment')) return false;
        if (xor(!!column.primaryKey, currentColumn.Key === 'PRI')) return false;
        if (xor(!!column.nonNull, currentColumn.Null === 'NO')) return false;
        if (xor(!!column.unique, ['PRI', 'UNI'].includes(currentColumn.Key))) return false;
        if (getRawColumnType(column) !== currentColumn.Type) return false;
    }

    return true;
}

function getRawColumnType(column: ColumnDescriptor): string {
    const lc = column.type.toLowerCase();
    if ('size' in column) return `${lc}(${column.size})`;
    if ('values' in column) return `${lc}(${column.values.map(parseQueryValue).join(',')})`;
    return lc;
}
