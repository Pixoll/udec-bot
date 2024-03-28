"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.QueryErrorNumber = exports.ColumnType = void 0;
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
var QueryErrorNumber;
(function (QueryErrorNumber) {
    QueryErrorNumber[QueryErrorNumber["CannotDeleteParent"] = 1451] = "CannotDeleteParent";
})(QueryErrorNumber || (exports.QueryErrorNumber = QueryErrorNumber = {}));
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
    async isConnected() {
        return await this.connection.query('SELECT 1;').catch(() => null).then(v => !!v);
    }
    async connect() {
        if (await this.isConnected())
            return;
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
            const success = await this.createTableIfNotExists(table);
            if (!success)
                return;
            await this.checkTableStructureIntegrity(table);
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
        await this.connect();
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
                error: error,
            };
        }
    }
    async queryFromBuilder(BuilderConstructor, tableName, builderFn) {
        const table = this.tables.find(t => t.name === tableName);
        const sqlBuilder = new BuilderConstructor(table);
        builderFn?.(sqlBuilder);
        return await this.query(sqlBuilder.toString());
    }
    async checkTableStructureIntegrity(table) {
        const query = await this.query(`DESCRIBE ${table.name};`);
        if (!query.ok)
            return;
        const currentStructure = query.result[0];
        const isSameStructure = validateTableStructure(currentStructure, table.columns);
        if (isSameStructure)
            return;
        logger_1.Logger.error('Non-matching structures:', table.columns, '=>', currentStructure);
    }
    async createTableIfNotExists(table) {
        const primaryKeys = table.columns.filter(c => c.primaryKey).map(c => c.name);
        const foreignKeys = table.foreignKeys?.map(fk => `FOREIGN KEY (${fk.keys.join(', ')}) REFERENCES ${fk.references}(${fk.referenceKeys.join(', ')})`).join(', ');
        const createTable = `CREATE TABLE IF NOT EXISTS ${this.name}.${table.name} (`
            + table.columns.map(column => `${column.name} ${column.type}`
                + ('size' in column ? `(${column.size})` : '')
                + ('values' in column ? `(${column.values.map(n => `"${n}"`).join(', ')})` : '')
                + (column.unique ? ' UNIQUE' : '')
                + (column.nonNull ? ' NOT NULL' : '')
                + (column.autoIncrement ? ' AUTO_INCREMENT' : '')).join(', ')
            + (primaryKeys.length > 0 ? `, PRIMARY KEY (${primaryKeys.join(', ')})` : '')
            + (foreignKeys ? `, ${foreignKeys}` : '')
            + ');';
        const result = await this.query(createTable);
        return result.ok;
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
        if ((0, util_1.xor)(!!(column.unique || column.primaryKey), ['PRI', 'UNI'].includes(currentColumn.Key)))
            return false;
        if ((0, util_1.xor)(!!column.nonNull, currentColumn.Null === 'NO'))
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
        return `${lc}(${column.values.map(v => (0, queryBuilder_1.parseQueryValue)(v)).join(',')})`;
    return lc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2RiL2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDRDQU93QjtBQUN4QixzQ0FBbUM7QUFDbkMsaURBU3dCO0FBQ3hCLGtDQUF3QztBQUV4QyxJQUFZLFVBUVg7QUFSRCxXQUFZLFVBQVU7SUFDbEIsK0JBQWlCLENBQUE7SUFDakIsb0NBQXNCLENBQUE7SUFDdEIsMkJBQWEsQ0FBQTtJQUNiLDJCQUFhLENBQUE7SUFDYiw2QkFBZSxDQUFBO0lBQ2YsZ0NBQWtCLENBQUE7SUFDbEIscUNBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQVJXLFVBQVUsMEJBQVYsVUFBVSxRQVFyQjtBQUVELElBQVksZ0JBRVg7QUFGRCxXQUFZLGdCQUFnQjtJQUN4QixzRkFBeUIsQ0FBQTtBQUM3QixDQUFDLEVBRlcsZ0JBQWdCLGdDQUFoQixnQkFBZ0IsUUFFM0I7QUFtR0QsTUFBYSxRQUFRO0lBVWpCLFlBQW1CLE9BQWdDO1FBQy9DLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDNUYsTUFBTSxDQUFDLE1BQU0sQ0FBOEYsSUFBSSxFQUFFO1lBQzdHLElBQUksRUFBRSxPQUFPO1lBQ2IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixVQUFVLEVBQUUsY0FBYztZQUMxQixRQUFRLEVBQUUsV0FBVztZQUNyQixRQUFRLEVBQUUsV0FBVztZQUNyQixJQUFJLEVBQUUsT0FBTztTQUNoQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRVosSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztR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