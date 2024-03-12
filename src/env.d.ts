declare module 'process' {
    global {
        namespace NodeJS {
            interface ProcessEnv {
                TELEGRAM_TOKEN: string;
                OWNER_ID: string;
            }
        }
    }
}
