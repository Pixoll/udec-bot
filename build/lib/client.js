"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramClient = void 0;
const kysely_1 = require("kysely");
const mysql2_1 = require("mysql2");
const path_1 = __importDefault(require("path"));
const telegraf_1 = require("telegraf");
const logger_1 = require("./logger");
const registry_1 = require("./registry");
class TelegramClient extends telegraf_1.Telegraf {
    registry;
    db;
    activeMenus;
    ready;
    constructor(options) {
        const { TELEGRAM_TOKEN } = process.env;
        if (!TELEGRAM_TOKEN) {
            throw new Error("A TELEGRAM_TOKEN env. variable must be specified.");
        }
        super(TELEGRAM_TOKEN);
        const { DB_HOST, DB_PORT, DB_SOCKET_PATH, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
        this.db = new kysely_1.Kysely({
            dialect: new kysely_1.MysqlDialect({
                pool: (0, mysql2_1.createPool)({
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
        logger_1.Logger.info("Registering commands and type handlers...");
        this.registry = new registry_1.ClientRegistry(this);
        this.registry.registerTypeHandlersIn(path_1.default.join(__dirname, "./types"), "base")
            .registerCommandsIn(options.commandsDir);
        this.catch((...args) => this.catchError(...args));
    }
    async catchError(error, context) {
        const messageId = context.msgId;
        logger_1.Logger.error(error);
        context.reply("Ocurrió un error y ha sido notificado al mantenedor del bot.", {
            ...messageId && ({
                "reply_parameters": {
                    "message_id": messageId,
                    "allow_sending_without_reply": true,
                },
            }),
        });
        const { ownerId } = this;
        if (!ownerId)
            return;
        const stack = error instanceof Error ? error.stack ?? error : error;
        context.telegram.sendMessage(ownerId, `An unexpected error has occurred:\n\n${stack}`);
    }
    async login() {
        logger_1.Logger.info("Starting Telegram Client...");
        if (this.ready) {
            process.emitWarning("Telegram Client has been already launched. Make sure to only call this method once.");
            return;
        }
        this.launch({ dropPendingUpdates: true }, () => {
            this.ready = true;
            logger_1.Logger.info("Telegram Client is ready.");
        });
    }
}
exports.TelegramClient = TelegramClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbUNBQThDO0FBQzlDLG1DQUFvQztBQUNwQyxnREFBd0I7QUFDeEIsdUNBQTZDO0FBRTdDLHFDQUFrQztBQUNsQyx5Q0FBNEM7QUFFNUMsTUFBYSxjQUFpRCxTQUFRLG1CQUFRO0lBRTFELFFBQVEsQ0FBaUI7SUFDekIsRUFBRSxDQUFtQjtJQUNyQixXQUFXLENBQTZCO0lBQ2hELEtBQUssQ0FBVTtJQUV2QixZQUFtQixPQUE4QjtRQUM3QyxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUN2QyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFdEIsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUU1RixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksZUFBTSxDQUFXO1lBQzNCLE9BQU8sRUFBRSxJQUFJLHFCQUFZLENBQUM7Z0JBQ3RCLElBQUksRUFBRSxJQUFBLG1CQUFVLEVBQUM7b0JBQ2IsSUFBSSxFQUFFLE9BQU87b0JBQ2IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVM7b0JBQ3BDLFVBQVUsRUFBRSxjQUFjO29CQUMxQixJQUFJLEVBQUUsV0FBVztvQkFDakIsUUFBUSxFQUFFLFdBQVc7b0JBQ3JCLFFBQVEsRUFBRSxPQUFPO29CQUNqQixpQkFBaUIsRUFBRSxJQUFJO29CQUN2QixnQkFBZ0IsRUFBRSxJQUFJO2lCQUN6QixDQUFDO2FBQ0wsQ0FBQztTQUNMLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUMvQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbkIsZUFBTSxDQUFDLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx5QkFBYyxDQUFDLElBQWlDLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLE1BQU0sQ0FBQzthQUN4RSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFjLEVBQUUsT0FBZ0I7UUFDcEQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUNoQyxlQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsOERBQThELEVBQUU7WUFDMUUsR0FBRyxTQUFTLElBQUksQ0FBQztnQkFDYixrQkFBa0IsRUFBRTtvQkFDaEIsWUFBWSxFQUFFLFNBQVM7b0JBQ3ZCLDZCQUE2QixFQUFFLElBQUk7aUJBQ3RDO2FBQ0osQ0FBQztTQUNMLENBQUMsQ0FBQztRQUVILE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRXJCLE1BQU0sS0FBSyxHQUFHLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDcEUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLHdDQUF3QyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSztRQUNkLGVBQU0sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxXQUFXLENBQUMscUZBQXFGLENBQUMsQ0FBQztZQUMzRyxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUU7WUFDM0MsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsZUFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBM0VELHdDQTJFQyJ9