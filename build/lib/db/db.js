"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.ColumnType = void 0;
const promise_1 = require("mysql2/promise");
const logger_1 = require("../logger");
const queryBuilder_1 = require("./queryBuilder");
const util_1 = require("../util");
var ColumnType;
(function (ColumnType) {
    ColumnType["Bigint"] = "BIGINT";
    ColumnType["Boolean"] = "TINYINT(1)";
    ColumnType["Date"] = "DATE";
    ColumnType["Enum"] = "ENUM";
    ColumnType["Integer"] = "INT";
    ColumnType["String"] = "VARCHAR";
    ColumnType["Timestamp"] = "TIMESTAMP";
})(ColumnType || (exports.ColumnType = ColumnType = {}));
class Database {
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
    }
    async connect() {
        logger_1.Logger.info('Connecting to database...');
        this.connection = await (0, promise_1.createConnection)({
            host: this.host,
            port: this.port,
            socketPath: this.socketPath,
            user: this.username,
            password: this.password,
        });
        logger_1.Logger.info('Connected to database.');
        await this.setup();
    }
    async disconnect() {
        logger_1.Logger.info('Disconnecting from database...');
        await this.connection.end();
        logger_1.Logger.info('Disconnected from database.');
    }
    async setup() {
        logger_1.Logger.info('Setting up database...');
        const r1 = await this.query(`CREATE DATABASE IF NOT EXISTS ${this.name};`);
        if (!r1)
            return;
        const r2 = await this.query(`USE ${this.name};`);
        if (!r2)
            return;
        for (const table of this.tables) {
            const exists = await this.checkTableExists(table.name);
            if (exists) {
                await this.applyTableStructure(table);
                continue;
            }
            const tableCreationQuery = this.getTableCreationQuery(table);
            const rt = await this.query(tableCreationQuery);
            if (!rt)
                return;
        }
        logger_1.Logger.info('Database is ready.');
    }
    async select(tableName, builder) {
        const query = await this.queryFromBuilder(queryBuilder_1.SelectQueryBuilder, tableName, builder);
        if (!query.ok)
            return query;
        return {
            ok: true,
            result: query.result[0],
        };
    }
    async insert(tableName, builder) {
        const query = await this.queryFromBuilder(queryBuilder_1.InsertQueryBuilder, tableName, builder);
        if (!query.ok)
            return query;
        return {
            ok: true,
            result: query.result[0],
        };
    }
    async update(tableName, builder) {
        return await this.queryFromBuilder(queryBuilder_1.UpdateQueryBuilder, tableName, builder);
    }
    async delete(tableName, builder) {
        return await this.queryFromBuilder(queryBuilder_1.DeleteQueryBuilder, tableName, builder);
    }
    async query(sql) {
        logger_1.Logger.info('MySQL instruction:', sql);
        try {
            const result = await this.connection.query(sql);
            logger_1.Logger.info('Result =>', result);
            return {
                ok: true,
                result,
            };
        }
        catch (error) {
            logger_1.Logger.error(error);
            return {
                ok: false,
                error,
            };
        }
    }
    async queryFromBuilder(BuilderConstructor, tableName, builderFn) {
        const table = this.tables.find(t => t.name === tableName);
        const sqlBuilder = new BuilderConstructor(table);
        builderFn?.(sqlBuilder);
        return await this.query(sqlBuilder.toString());
    }
    async checkTableExists(name) {
        const query = await this.query(`SHOW TABLES LIKE "${name}";`);
        return !query.ok || (Array.isArray(query.result) && query.result[0].length > 0);
    }
    async applyTableStructure(table) {
        const query = await this.query(`DESCRIBE ${table.name};`);
        if (!query.ok)
            return;
        const currentStructure = query.result[0];
        const isSameStructure = validateTableStructure(currentStructure, table.columns);
        if (isSameStructure)
            return;
        logger_1.Logger.error('Non-matching structures:', table.columns, '=>', currentStructure);
    }
    getTableCreationQuery(table) {
        return `CREATE TABLE ${this.name}.${table.name} (`
            + table.columns.map(column => `${column.name} ${column.type}`
                + ('size' in column ? `(${column.size})` : '')
                + ('values' in column ? `(${column.values.map(n => `"${n}"`).join(', ')})` : '')
                + (column.primaryKey ? ' PRIMARY KEY' : '')
                + (column.unique ? ' UNIQUE' : '')
                + (column.nonNull ? ' NOT NULL' : '')
                + (column.autoIncrement ? ' AUTO_INCREMENT' : '')).join(', ')
            + ');';
    }
}
exports.Database = Database;
function validateTableStructure(currentColumns, columnsToMatch) {
    if (currentColumns.length !== columnsToMatch.length)
        return false;
    const namesUnion = new Set([...currentColumns.map(c => c.Field), ...columnsToMatch.map(c => c.name)]);
    if (namesUnion.size !== columnsToMatch.length)
        return false;
    for (const column of columnsToMatch) {
        const currentColumn = currentColumns.find(c => c.Field === column.name);
        if (!currentColumn)
            return false;
        if (currentColumn.Default !== null)
            return false;
        if ((0, util_1.xor)(!!column.autoIncrement, currentColumn.Extra === 'auto_increment'))
            return false;
        if ((0, util_1.xor)(!!column.primaryKey, currentColumn.Key === 'PRI'))
            return false;
        if ((0, util_1.xor)(!!column.nonNull, currentColumn.Null === 'NO'))
            return false;
        if ((0, util_1.xor)(!!column.unique, ['PRI', 'UNI'].includes(currentColumn.Key)))
            return false;
        if (getRawColumnType(column) !== currentColumn.Type)
            return false;
    }
    return true;
}
function getRawColumnType(column) {
    const lc = column.type.toLowerCase();
    if ('size' in column)
        return `${lc}(${column.size})`;
    if ('values' in column)
        return `${lc}(${column.values.map(queryBuilder_1.parseQueryValue).join(',')})`;
    return lc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RiL2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDRDQUFtSDtBQUNuSCxzQ0FBbUM7QUFDbkMsaURBU3dCO0FBQ3hCLGtDQUF3QztBQUV4QyxJQUFZLFVBUVg7QUFSRCxXQUFZLFVBQVU7SUFDbEIsK0JBQWlCLENBQUE7SUFDakIsb0NBQXNCLENBQUE7SUFDdEIsMkJBQWEsQ0FBQTtJQUNiLDJCQUFhLENBQUE7SUFDYiw2QkFBZSxDQUFBO0lBQ2YsZ0NBQWtCLENBQUE7SUFDbEIscUNBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQVJXLFVBQVUsMEJBQVYsVUFBVSxRQVFyQjtBQXdGRCxNQUFhLFFBQVE7SUFVakIsWUFBbUIsT0FBZ0M7UUFDL0MsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUM1RixNQUFNLENBQUMsTUFBTSxDQUE4RixJQUFJLEVBQUU7WUFDN0csSUFBSSxFQUFFLE9BQU87WUFDYixJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLFVBQVUsRUFBRSxjQUFjO1lBQzFCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLElBQUksRUFBRSxPQUFPO1NBQ2hCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFWixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7SUFDTCxDQUFDO0lBRU0sS0FBSyxDQUFDLE9BQU87UUFDaEIsZUFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBRXpDLElBQUks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