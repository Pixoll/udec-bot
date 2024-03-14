"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.ColumnType = void 0;
const mysql2_1 = require("mysql2");
const logger_1 = require("../logger");
const queryBuilder_1 = require("./queryBuilder");
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
        const { DB_HOST, DB_PORT, DB_SOCKET_PATH, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
        Object.assign(this, {
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
        this.connection = (0, mysql2_1.createConnection)({
            host: this.host,
            port: this.port,
            socketPath: this.socketPath,
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
    async select(tableName, builder) {
        return await this.queryFromBuilder(queryBuilder_1.SelectQueryBuilder, tableName, builder);
    }
    async insert(tableName, builder) {
        return await this.queryFromBuilder(queryBuilder_1.InsertQueryBuilder, tableName, builder);
    }
    async update(tableName, builder) {
        return await this.queryFromBuilder(queryBuilder_1.UpdateQueryBuilder, tableName, builder);
    }
    async queryFromBuilder(BuilderConstructor, tableName, builderFn) {
        const table = this.tables.find(t => t.name === tableName);
        const sqlBuilder = new BuilderConstructor(table);
        builderFn?.(sqlBuilder);
        return await this.rawQuery(sqlBuilder.toString());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RiL2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUEyRztBQUMzRyxzQ0FBbUM7QUFDbkMsaURBQXVIO0FBR3ZILElBQVksVUFPWDtBQVBELFdBQVksVUFBVTtJQUNsQixpQ0FBbUIsQ0FBQTtJQUNuQiwyQkFBYSxDQUFBO0lBQ2IsMkJBQWEsQ0FBQTtJQUNiLDZCQUFlLENBQUE7SUFDZixnQ0FBa0IsQ0FBQTtJQUNsQixxQ0FBdUIsQ0FBQTtBQUMzQixDQUFDLEVBUFcsVUFBVSwwQkFBVixVQUFVLFFBT3JCO0FBV0QsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQVUsQ0FBQztBQWlENUQsTUFBYSxRQUFRO0lBUUQsVUFBVSxDQUFhO0lBRXZDLFlBQW1CLE9BQWdDO1FBQy9DLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFHLGNBQWMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDN0YsTUFBTSxDQUFDLE1BQU0sQ0FBOEYsSUFBSSxFQUFFO1lBQzdHLElBQUksRUFBRSxPQUFPO1lBQ2IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixVQUFVLEVBQUUsY0FBYztZQUMxQixRQUFRLEVBQUUsV0FBVztZQUNyQixRQUFRLEVBQUUsV0FBVztZQUNyQixJQUFJLEVBQUUsT0FBTztTQUNoQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRVosSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFBLHlCQUFnQixFQUFDO1lBQy9C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