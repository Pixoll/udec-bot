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
            return logger_1.Logger.warn(0);
        const r2 = await this.rawQuery(`USE ${this.name};`);
        if (!r2)
            return logger_1.Logger.warn(1);
        for (const table of this.tables) {
            // eslint-disable-next-line no-await-in-loop
            const exists = await this.checkTableExists(table.name);
            if (exists)
                continue;
            const tableCreationQuery = this.getTableCreationQuery(table);
            // eslint-disable-next-line no-await-in-loop
            const rt = await this.rawQuery(tableCreationQuery);
            if (!rt)
                return logger_1.Logger.warn(table.name);
        }
        logger_1.Logger.info('Database is ready.');
    }
    async rawQuery(sql) {
        return new Promise((resolve) => this.connection.query(sql, (error, result) => {
            logger_1.Logger.info(sql, '=>', result);
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
            + (uniques.length > 0 ? ', ' + uniques.map(name => `UNIQUE INDEX ${name}_UNIQUE (${name} ASC) VISIBLE`).join(', ') : '')
            + ');';
    }
}
exports.Database = Database;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RiL2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFxSDtBQUNySCxzQ0FBbUM7QUFFbkMsSUFBWSxVQU9YO0FBUEQsV0FBWSxVQUFVO0lBQ2xCLGlDQUFtQixDQUFBO0lBQ25CLDJCQUFhLENBQUE7SUFDYiwyQkFBYSxDQUFBO0lBQ2IsNkJBQWUsQ0FBQTtJQUNmLGdDQUFrQixDQUFBO0lBQ2xCLHFDQUF1QixDQUFBO0FBQzNCLENBQUMsRUFQVyxVQUFVLDBCQUFWLFVBQVUsUUFPckI7QUFFRCxNQUFNLHNCQUFzQixHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBVSxDQUFDO0FBNkM1RCxNQUFhLFFBQVE7SUFPRCxVQUFVLENBQWE7SUFFdkMsWUFBbUIsT0FBZ0M7UUFDL0MsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQzVFLE1BQU0sQ0FBQyxNQUFNLENBQThGLElBQUksRUFBRTtZQUM3RyxJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksRUFBRSxDQUFDLE9BQU87WUFDZCxRQUFRLEVBQUUsV0FBVztZQUNyQixRQUFRLEVBQUUsV0FBVztZQUNyQixJQUFJLEVBQUUsT0FBTztTQUNoQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRVosSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFBLHlCQUFnQixFQUFDO1lBQy9CLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUTtZQUNu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