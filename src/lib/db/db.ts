import { Connection, ProcedureCallPacket, ResultSetHeader, RowDataPacket, createConnection } from 'mysql2';
import { Logger } from '../logger';

export enum ColumnType {
    Boolean = 'BOOLEAN',
    Date = 'DATE',
    Enum = 'ENUM',
    Integer = 'INT',
    String = 'VARCHAR',
    Timestamp = 'TIMESTAMP',
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
    readonly username?: string;
    readonly password?: string;
    readonly name?: string;
    readonly tables: Tables;
}

type RawQueryResult =
    | ResultSetHeader
    | ResultSetHeader[]
    | RowDataPacket[]
    | RowDataPacket[][]
    | ProcedureCallPacket;

export class Database<Tables extends TablesArray> implements DatabaseOptions<Tables> {
    public declare readonly host: string;
    public declare readonly port: number;
    public declare readonly username: string;
    public declare readonly password: string;
    public declare readonly name: string;
    public declare readonly tables: Tables;
    public readonly connection: Connection;

    public constructor(options: DatabaseOptions<Tables>) {
        const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
        Object.assign<Database<Tables>, Omit<DatabaseOptions<Tables>, 'tables'>, Partial<DatabaseOptions<Tables>>>(this, {
            host: DB_HOST,
            port: +DB_PORT,
            username: DB_USERNAME,
            password: DB_PASSWORD,
            name: DB_NAME,
        }, options);

        if (!this.tables) {
            throw new Error('DatabaseOptions.tables must be specified.');
        }

        this.connection = createConnection({
            host: this.host,
            port: this.port,
            user: this.username,
            password: this.password,
        });
    }

    public async connect(): Promise<void> {
        Logger.info('Connecting to database...');
        return new Promise<void>((resolve, reject) => {
            this.connection.connect((error) => {
                if (error) reject(error);
                Logger.info('Connected to database.');
                resolve();
            });
        }).then(() => this.setup());
    }

    public async disconnect(): Promise<void> {
        Logger.info('Disconnecting from database...');
        return new Promise<void>((resolve, reject) => {
            this.connection.end((error) => {
                if (error) reject(error);
                Logger.info('Disconnected from database.');
                resolve();
            });
        });
    }

    private async setup(): Promise<void> {
        Logger.info('Setting up database...');

        const r1 = await this.rawQuery(`CREATE DATABASE IF NOT EXISTS ${this.name};`);
        if (!r1) return Logger.warn(0);
        const r2 = await this.rawQuery(`USE ${this.name};`);
        if (!r2) return Logger.warn(1);

        for (const table of this.tables) {
            // eslint-disable-next-line no-await-in-loop
            const exists = await this.checkTableExists(table.name);
            if (exists) continue;

            const tableCreationQuery = this.getTableCreationQuery(table);
            // eslint-disable-next-line no-await-in-loop
            const rt = await this.rawQuery(tableCreationQuery);
            if (!rt) return Logger.warn(table.name);
        }

        Logger.info('Database is ready.');
    }

    private async rawQuery(sql: string): Promise<RawQueryResult | null> {
        return new Promise((resolve) =>
            this.connection.query(sql, (error, result) => {
                Logger.info(sql, '=>', result);
                if (error) Logger.error(error);
                resolve(error ? null : result as RawQueryResult);
            })
        );
    }

    private async checkTableExists(name: string): Promise<boolean> {
        const result = await this.rawQuery(`SHOW TABLES LIKE "${name}";`);
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
            + (uniques.length > 0 ? ', ' + uniques.map(name =>
                `UNIQUE INDEX ${name}_UNIQUE (${name} ASC) VISIBLE`
            ).join(', ') : '')
            + ');';
    }
}
