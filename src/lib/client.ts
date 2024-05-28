import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import path from "path";
import { Context, Telegraf } from "telegraf";
import { SessionString } from "./commands";
import { Logger } from "./logger";
import { ClientRegistry } from "./registry";

export class TelegramClient<Database extends object = object> extends Telegraf {
    public declare readonly ownerId: number | null;
    public readonly registry: ClientRegistry;
    public readonly db: Kysely<Database>;
    public readonly activeMenus: Map<SessionString, string>;
    private ready: boolean;

    public constructor(options: TelegramClientOptions) {
        const { TELEGRAM_TOKEN } = process.env;
        if (!TELEGRAM_TOKEN) {
            throw new Error("A TELEGRAM_TOKEN env. variable must be specified.");
        }

        super(TELEGRAM_TOKEN);

        const { DB_HOST, DB_PORT, DB_SOCKET_PATH, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

        this.db = new Kysely<Database>({
            dialect: new MysqlDialect({
                pool: createPool({
                    host: DB_HOST,
                    port: DB_PORT ? +DB_PORT : undefined,
                    socketPath: DB_SOCKET_PATH,
                    user: DB_USERNAME,
                    password: DB_PASSWORD,
                    database: DB_NAME,
                    supportBigNumbers: true,
                    bigNumberStrings: true,
                }),
            }),
        });

        this.ownerId = options.ownerId;
        this.activeMenus = new Map();
        this.ready = false;

        Logger.info("Registering commands and type handlers...");
        this.registry = new ClientRegistry(this as unknown as TelegramClient);
        this.registry.registerTypeHandlersIn(path.join(__dirname, "./types"), "base")
            .registerCommandsIn(options.commandsDir);

        this.catch((...args) => this.catchError(...args));
    }

    public async catchError(error: unknown, context: Context): Promise<void> {
        const messageId = context.msgId;
        Logger.error(error);
        context.reply("Ocurrió un error y ha sido notificado al mantenedor del bot.", {
            ...messageId && ({
                "reply_parameters": {
                    "message_id": messageId,
                    "allow_sending_without_reply": true,
                },
            }),
        });

        const { ownerId } = this;
        if (!ownerId) return;

        const stack = error instanceof Error ? error.stack ?? error : error;
        context.telegram.sendMessage(ownerId, `An unexpected error has occurred:\n\n${stack}`);
    }

    public async login(): Promise<void> {
        Logger.info("Starting Telegram Client...");
        if (this.ready) {
            process.emitWarning("Telegram Client has been already launched. Make sure to only call this method once.");
            return;
        }

        this.launch({ dropPendingUpdates: true }, () => {
            this.ready = true;
            Logger.info("Telegram Client is ready.");
        });
    }
}

export interface TelegramClientOptions {
    readonly commandsDir: string;
    readonly ownerId: number | null;
}
