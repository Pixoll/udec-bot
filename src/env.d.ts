declare module "process" {
    global {
        namespace NodeJS {
            // noinspection JSUnusedGlobalSymbols
            interface ProcessEnv {
                TELEGRAM_TOKEN: string;
                OWNER_ID: string;
                DB_HOST?: string;
                DB_PORT?: string;
                DB_SOCKET_PATH?: string;
                DB_USERNAME: string;
                DB_PASSWORD?: string;
                DB_NAME: string;
            }
        }
    }
}
