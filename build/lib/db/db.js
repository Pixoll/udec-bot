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