"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mysql2_1 = require("mysql2");
const lib_1 = require("../lib");
class Database {
    client;
    connection;
    constructor(client, options) {
        this.client = client;
        const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
        Object.assign(this, {
            host: DB_HOST,
            port: +DB_PORT,
            username: DB_USERNAME,
            password: DB_PASSWORD,
            name: DB_NAME,
        }, options ?? {});
        validateCredentials(this);
        this.connection = (0, mysql2_1.createConnection)({
            host: this.host,
            port: this.port,
            user: this.username,
            password: this.password,
            database: this.name,
        });
    }
    async connect() {
        lib_1.Logger.info('Connecting to database...');
        return new Promise((resolve, reject) => {
            this.connection.connect((error) => {
                if (error)
                    reject(error);
                lib_1.Logger.info('Connected to database.');
                resolve();
            });
        });
    }
    async disconnect() {
        lib_1.Logger.info('Disconnecting from database...');
        return new Promise((resolve, reject) => {
            this.connection.end((error) => {
                if (error)
                    reject(error);
                lib_1.Logger.info('Disconnected from database.');
                resolve();
            });
        });
    }
}
exports.Database = Database;
function validateCredentials(db) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQXNEO0FBQ3RELGdDQUFnRDtBQVVoRCxNQUFhLFFBQVE7SUFDRCxNQUFNLENBQWlCO0lBTXRCLFVBQVUsQ0FBYTtJQUV4QyxZQUFtQixNQUFzQixFQUFFLE9BQXlCO1FBQ2hFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUM1RSxNQUFNLENBQUMsTUFBTSxDQUFzRCxJQUFJLEVBQUU7WUFDckUsSUFBSSxFQUFFLE9BQU87WUFDYixJQUFJLEVBQUUsQ0FBQyxPQUFPO1lBQ2QsUUFBUSxFQUFFLFdBQVc7WUFDckIsUUFBUSxFQUFFLFdBQVc7WUFDckIsSUFBSSxFQUFFLE9BQU87U0FDaEIsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7UUFFbEIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFBLHlCQUFnQixFQUFDO1lBQy9CLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUTtZQUNuQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ3RCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBTztRQUNoQixZQUFNLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDekMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUM5QixJQUFJLEtBQUs7b0JBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QixZQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7Z0JBQ3RDLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsVUFBVTtRQUNuQixZQUFNLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDOUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUMxQixJQUFJLEtBQUs7b0JBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QixZQUFNLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7Z0JBQzNDLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXJERCw0QkFxREM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLEVBQVk7SUFDckMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFFcEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUN6RCxDQUFDO0FBQ0wsQ0FBQyJ9