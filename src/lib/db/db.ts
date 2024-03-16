import { Connection, ProcedureCallPacket, ResultSetHeader, RowDataPacket, createConnection } from 'mysql2/promise';
import { Logger } from '../logger';
import {
    ConstructableQueryBuilder,
    InsertQueryBuilder,
    QueryBuilder,
    SelectQueryBuilder,
    UpdateQueryBuilder,
} from './queryBuilder';
import { ValuesOf } from '../util';

export enum ColumnType {
    Boolean = 'BOOLEAN',
    Date = 'DATE',
    Enum = 'ENUM',
    Integer = 'INT',
    String = 'VARCHAR',
    Timestamp = 'TIMESTAMP',
}

export interface ColumnTypeMap {
    [ColumnType.Boolean]: boolean;
    [ColumnType.Date]: Date;
    [ColumnType.Enum]: unknown;
    [ColumnType.Integer]: number;
    [ColumnType.String]: string;
    [ColumnType.Timestamp]: Date;
}

const sizeLimitedColumnTypes = [ColumnType.String] as const;

export type SizeLimitedColumnTypes = (typeof sizeLimitedColumnTypes)[number];

export type ColumnDescriptor = {
    readonly name: string;
    readonly primaryKey?: boolean;
    readonly nonNull?: boolean;
    readonly unique?: boolean;
    readonly autoIncrement?: boolean;
} & ({
    readonly type: Exclude<ColumnType, SizeLimitedColumnTypes | ColumnType.Enum>;
} | {
    readonly type: SizeLimitedColumnTypes;
    readonly size: number;
} | {
    readonly type: ColumnType.Enum;
    readonly values: readonly string[];
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

type RawQueryResult =
    | ResultSetHeader[]
    | RowDataPacket[]
    | RowDataPacket[][]
    | ProcedureCallPacket;

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
        const { DB_HOST, DB_PORT,  DB_SOCKET_PATH, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
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
            // eslint-disable-next-line no-await-in-loop
            const exists = await this.checkTableExists(table.name);
            if (exists) continue;

            const tableCreationQuery = this.getTableCreationQuery(table);
            // eslint-disable-next-line no-await-in-loop
            const rt = await this.query(tableCreationQuery);
            if (!rt) return;
        }

        Logger.info('Database is ready.');
    }

    public async select<TableName extends TableNames<Tables>, Table extends TableFromName<Tables, TableName>>(
        tableName: TableName,
        builder?: (queryBuilder: SelectQueryBuilder<Table>) => QueryBuilder
    ): Promise<unknown> {
        return await this.queryFromBuilder(SelectQueryBuilder, tableName, builder);
    }

    public async insert<TableName extends TableNames<Tables>, Table extends TableFromName<Tables, TableName>>(
        tableName: TableName,
        builder: (queryBuilder: InsertQueryBuilder<Table>) => QueryBuilder
    ): Promise<ResultSetHeader> {
        const result = await this.queryFromBuilder<InsertQueryBuilder<Table>, ResultSetHeader[]>(
            InsertQueryBuilder, tableName, builder
        );
        return result[0];
    }

    public async update<TableName extends TableNames<Tables>, Table extends TableFromName<Tables, TableName>>(
        tableName: TableName,
        builder: (queryBuilder: UpdateQueryBuilder<Table>) => QueryBuilder
    ): Promise<unknown> {
        return await this.queryFromBuilder(UpdateQueryBuilder, tableName, builder);
    }

    public async query<Result extends RawQueryResult | null>(sql: string): Promise<Result> {
        let result: Result;
        try {
            result = await this.connection.query(sql) as unknown as Result;
        } catch (error) {
            Logger.error(error);
            result = null as Result;
        }
        return result;
    }

    private async queryFromBuilder<Builder, Result extends RawQueryResult | null>(
        BuilderConstructor: ConstructableQueryBuilder,
        tableName: string,
        builderFn?: (queryBuilder: Builder) => QueryBuilder
    ): Promise<Result> {
        const table = this.tables.find(t => t.name === tableName) as TableDescriptor;
        const sqlBuilder = new BuilderConstructor(table);
        builderFn?.(sqlBuilder as Builder);
        return await this.query(sqlBuilder.toString());
    }

    private async checkTableExists(name: string): Promise<boolean> {
        const result = await this.query(`SHOW TABLES LIKE "${name}";`);
        return Array.isArray(result) && result.length > 0;
    }

    private getTableCreationQuery(table: TableDescriptor): string {
        const primaryKeys = table.columns.filter(c => c.primaryKey).map(c => c.name);
        const uniques = table.columns.filter(c => c.unique).map(c => c.name);

        return `CREATE TABLE ${this.name}.${table.name} (`
            + table.columns.map(column =>
                `${column.name} ${column.type}`
                + ('size' in column ? `(${column.size})` : '')
                + ('values' in column ? `(${column.values.map(n => `"${n}"`).join(', ')})` : '')
                + (column.nonNull ? ' NOT NULL' : '')
                + (column.autoIncrement ? ' AUTO_INCREMENT' : '')
            ).join(', ')
            + (primaryKeys.length > 0 ? `, PRIMARY KEY(${primaryKeys.join(', ')})` : '')
            + (uniques.length > 0
                ? `,${uniques.length > 1 ? `CONSTRAINT ${table.name}_UNIQUE` : ''} UNIQUE(${uniques.join(', ')})`
                : '')
            + ');';
    }
}
