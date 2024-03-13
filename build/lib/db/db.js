"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.ColumnType = void 0;
const mysql2_1 = require("mysql2");
const logger_1 = require("../logger");
var ColumnType;
(function (ColumnType) {
    ColumnType["Boolean"] = "BOOLEAN";
    ColumnType["Date"] = "DATE";
    ColumnType["Enum"] = "ENUM";
    ColumnType["Integer"] = "INT";
    ColumnType["String"] = "VARCHAR";
    ColumnType["Timestamp"] = "TIMESTAMP";
})(ColumnType || (exports.ColumnType = ColumnType = {}));
const sizeLimitedColumnTypes = [ColumnType.String];
class Database {
    connection;
    constructor(options) {
        const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
        Object.assign(this, {
            host: DB_HOST,
            port: +DB_PORT,
            username: DB_USERNAME,
            password: DB_PASSWORD,
            name: DB_NAME,
        }, options);
        if (!this.tables) {
            throw new Error('DatabaseOptions.tables must be specified.');
        }
        this.connection = (0, mysql2_1.createConnection)({
            host: this.host,
            port: this.port,
            user: this.username,
            password: this.password,
        });
    }
    async connect() {
        logger_1.Logger.info('Connecting to database...');
        return new Promise((resolve, reject) => {
            this.connection.connect((error) => {
                if (error)
                    reject(error);
                logger_1.Logger.info('Connected to database.');
                resolve();
            });
        }).then(() => this.setup());
    }
    async disconnect() {
        logger_1.Logger.info('Disconnecting from database...');
        return new Promise((resolve, reject) => {
            this.connection.end((error) => {
                if (error)
                    reject(error);
                logger_1.Logger.info('Disconnected from database.');
                resolve();
            });
        });
    }
    async setup() {
        logger_1.Logger.info('Setting up database...');
        const r1 = await this.rawQuery(`CREATE DATABASE IF NOT EXISTS ${this.name};`);
        if (!r1)
            return;
        const r2 = await this.rawQuery(`USE ${this.name};`);
        if (!r2)
            return;
        for (const table of this.tables) {
            // eslint-disable-next-line no-await-in-loop
            const exists = await this.checkTableExists(table.name);
            if (exists)
                continue;
            const tableCreationQuery = this.getTableCreationQuery(table);
            // eslint-disable-next-line no-await-in-loop
            const rt = await this.rawQuery(tableCreationQuery);
            if (!rt)
                return;
        }
        logger_1.Logger.info('Database is ready.');
    }
    async rawQuery(sql) {
        return new Promise((resolve) => this.connection.query(sql, (error, result) => {
            if (error)
                logger_1.Logger.error(error);
            resolve(error ? null : result);
        }));
    }
    async checkTableExists(name) {
        const result = await this.rawQuery(`SHOW TABLES LIKE "${name}";`);
        return Array.isArray(result) && result.length > 0;
    }
    getTableCreationQuery(table) {
        const primaryKeys = table.columns.filter(c => c.primaryKey).map(c => c.name);
        const uniques = table.columns.filter(c => c.unique).map(c => c.name);
        return `CREATE TABLE ${this.name}.${table.name} (`
            + table.columns.map(column => `${column.name} ${column.type}`
                + ('size' in column ? `(${column.size})` : '')
                + ('values' in column ? `(${column.values.map(n => `"${n}"`).join(', ')})` : '')
                + (column.nonNull ? ' NOT NULL' : '')
                + (column.autoIncrement ? ' AUTO_INCREMENT' : '')).join(', ')
            + (primaryKeys.length > 0 ? `, PRIMARY KEY(${primaryKeys.join(', ')})` : '')
            + (uniques.length > 0
                ? `,${uniques.length > 1 ? `CONSTRAINT ${table.name}_UNIQUE` : ''} UNIQUE(${uniques.join(', ')})`
                : '')
            + ');';
    }
}
exports.Database = Database;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RiL2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUEyRztBQUMzRyxzQ0FBbUM7QUFFbkMsSUFBWSxVQU9YO0FBUEQsV0FBWSxVQUFVO0lBQ2xCLGlDQUFtQixDQUFBO0lBQ25CLDJCQUFhLENBQUE7SUFDYiwyQkFBYSxDQUFBO0lBQ2IsNkJBQWUsQ0FBQTtJQUNmLGdDQUFrQixDQUFBO0lBQ2xCLHFDQUF1QixDQUFBO0FBQzNCLENBQUMsRUFQVyxVQUFVLDBCQUFWLFVBQVUsUUFPckI7QUFFRCxNQUFNLHNCQUFzQixHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBVSxDQUFDO0FBMkM1RCxNQUFhLFFBQVE7SUFPRCxVQUFVLENBQWE7SUFFdkMsWUFBbUIsT0FBZ0M7UUFDL0MsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQzVFLE1BQU0sQ0FBQyxNQUFNLENBQThGLElBQUksRUFBRTtZQUM3RyxJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksRUFBRSxDQUFDLE9BQU87WUFDZCxRQUFRLEVBQUUsV0FBVztZQUNyQixRQUFRLEVBQUUsV0FBVztZQUNyQixJQUFJLEVBQUUsT0FBTztTQUNoQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRVosSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFBLHlCQUFnQixFQUFDO1lBQy9CLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUTtZQUNu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