"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.ColumnType = void 0;
const promise_1 = require("mysql2/promise");
const logger_1 = require("../logger");
const queryBuilder_1 = require("./queryBuilder");
const util_1 = require("../util");
var ColumnType;
(function (ColumnType) {
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
        const result = await this.queryFromBuilder(queryBuilder_1.SelectQueryBuilder, tableName, builder);
        return result?.[0] ?? null;
    }
    async insert(tableName, builder) {
        const result = await this.queryFromBuilder(queryBuilder_1.InsertQueryBuilder, tableName, builder);
        return result?.[0] ?? null;
    }
    async update(tableName, builder) {
        return await this.queryFromBuilder(queryBuilder_1.UpdateQueryBuilder, tableName, builder);
    }
    async query(sql) {
        let result;
        try {
            result = await this.connection.query(sql);
        }
        catch (error) {
            logger_1.Logger.error(error);
            result = null;
        }
        logger_1.Logger.info('MySQL instruction:', sql, '=>', result);
        return result;
    }
    async queryFromBuilder(BuilderConstructor, tableName, builderFn) {
        const table = this.tables.find(t => t.name === tableName);
        const sqlBuilder = new BuilderConstructor(table);
        builderFn?.(sqlBuilder);
        return await this.query(sqlBuilder.toString());
    }
    async checkTableExists(name) {
        const result = await this.query(`SHOW TABLES LIKE "${name}";`);
        return Array.isArray(result) && result.length > 0;
    }
    async applyTableStructure(table) {
        const result = await this.query(`DESCRIBE ${table.name};`);
        if (!result)
            return;
        const isSameStructure = validateTableStructure(result[0], table.columns);
        if (isSameStructure)
            return;
        logger_1.Logger.error('Non-matching structures:', table.columns, '=>', result[0]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RiL2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDRDQUFtSDtBQUNuSCxzQ0FBbUM7QUFDbkMsaURBUXdCO0FBQ3hCLGtDQUF3QztBQUV4QyxJQUFZLFVBT1g7QUFQRCxXQUFZLFVBQVU7SUFDbEIsb0NBQXNCLENBQUE7SUFDdEIsMkJBQWEsQ0FBQTtJQUNiLDJCQUFhLENBQUE7SUFDYiw2QkFBZSxDQUFBO0lBQ2YsZ0NBQWtCLENBQUE7SUFDbEIscUNBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQVBXLFVBQVUsMEJBQVYsVUFBVSxRQU9yQjtBQXlFRCxNQUFhLFFBQVE7SUFVakIsWUFBbUIsT0FBZ0M7UUFDL0MsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUM1RixNQUFNLENBQUMsTUFBTSxDQUE4RixJQUFJLEVBQUU7WUFDN0csSUFBSSxFQUFFLE9BQU87WUFDYixJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLFVBQVUsRUFBRSxjQUFjO1lBQzFCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLElBQUksRUFBRSxPQUFPO1NBQ2hCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFWixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7SUFDTCxDQUFDO0lBRU0sS0FBSyxDQUFDLE9BQU87UUFDaEIsZUFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFB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