import { Connection, createConnection } from 'mysql2';
import { Logger, TelegramClient } from '../lib';

export interface DatabaseOptions {
    readonly host: string;
    readonly port: number;
    readonly username: string;
    readonly password: string;
    readonly name: string;
}

export class Database implements DatabaseOptions {
    public readonly client: TelegramClient;
    public declare readonly host: string;
    public declare readonly port: number;
    public declare readonly username: string;
    public declare readonly password: string;
    public declare readonly name: string;
    private readonly connection: Connection;

    public constructor(client: TelegramClient, options?: DatabaseOptions) {
        this.client = client;

        const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
        Object.assign<Database, DatabaseOptions, Partial<DatabaseOptions>>(this, {
            host: DB_HOST,
            port: +DB_PORT,
            username: DB_USERNAME,
            password: DB_PASSWORD,
            name: DB_NAME,
        }, options ?? {});

        validateCredentials(this);

        this.connection = createConnection({
            host: this.host,
            port: this.port,
            user: this.username,
            password: this.password,
            database: this.name,
        });
    }

    public async connect(): Promise<void> {
        Logger.info('Connecting to database...');
        return new Promise((resolve, reject) => {
            this.connection.connect((error) => {
                if (error) reject(error);
                Logger.info('Connected to database.');
                resolve();
            });
        });
    }

    public async disconnect(): Promise<void> {
        Logger.info('Disconnecting from database...');
        return new Promise((resolve, reject) => {
            this.connection.end((error) => {
                if (error) reject(error);
                Logger.info('Disconnected from database.');
                resolve();
            });
        });
    }
}

function validateCredentials(db: Database): void {
    const { host, port, username, password, name } = db;

    if (!host) {
        throw new Error('A database host must be provided.');
    }

    if (!port || isNaN(port)) {
        throw new Error('A valid database port must be provided.');
    }

    if (!username) {
        throw new Error('A database username must be provided.');
    }

    if (!password) {
        throw new Error('A database password must be provided.');
    }

    if (!name) {
        throw new Error('A database name must be provided.');
    }
}
