"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramClient = void 0;
const telegraf_1 = require("telegraf");
const registry_1 = require("./registry");
const path_1 = __importDefault(require("path"));
const util_1 = require("./util");
const logger_1 = require("./logger");
const db_1 = require("./db");
class TelegramClient extends telegraf_1.Telegraf {
    registry;
    db;
    activeMenus;
    ready;
    constructor(options) {
        const { TELEGRAM_TOKEN } = process.env;
        if (!TELEGRAM_TOKEN) {
            throw new Error('A TELEGRAM_TOKEN env. variable must be specified.');
        }
        super(TELEGRAM_TOKEN);
        Object.assign(this, (0, util_1.omit)(options, ['commandsDir', 'db']));
        this.db = new db_1.Database(options.db);
        this.activeMenus = new Map();
        this.ready = false;
        logger_1.Logger.info('Registering commands and type handlers...');
        this.registry = new registry_1.ClientRegistry(this);
        this.registry.registerTypeHandlersIn(path_1.default.join(__dirname, './types'), 'base')
            .registerCommandsIn(options.commandsDir);
        this.catch((...args) => this.catchError(...args));
    }
    async catchError(error, context) {
        const messageId = context.message?.message_id;
        logger_1.Logger.error(error);
        context.reply('Ocurrió un error y ha sido notificado al mantenedor del bot.', {
            ...messageId && ({
                'reply_parameters': {
                    'message_id': messageId,
                    'allow_sending_without_reply': true,
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
        await this.db.connect();
        logger_1.Logger.info('Starting Telegram Client...');
        if (this.ready) {
            process.emitWarning('Telegram Client has been already launched. Make sure to only call this method once.');
            return;
        }
        this.launch({ dropPendingUpdates: true }, () => {
            this.ready = true;
            logger_1.Logger.info('Telegram Client is ready.');
        });
    }
}
exports.TelegramClient = TelegramClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsdUNBQTZDO0FBQzdDLHlDQUE0QztBQUM1QyxnREFBd0I7QUFDeEIsaUNBQThCO0FBQzlCLHFDQUFrQztBQUNsQyw2QkFBOEQ7QUFHOUQsTUFBYSxjQUNULFNBQVEsbUJBQVE7SUFHQSxRQUFRLENBQWlCO0lBQ3pCLEVBQUUsQ0FBbUI7SUFDckIsV0FBVyxDQUE2QjtJQUNoRCxLQUFLLENBQVU7SUFFdkIsWUFBbUIsT0FBc0M7UUFDckQsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDdkMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFMUQsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLGFBQVEsQ0FBUyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLGVBQU0sQ0FBQyxJQUFJLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUkseUJBQWMsQ0FBQyxJQUFxQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxNQUFNLENBQUM7YUFDeEUsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBYyxFQUFFLE9BQWdCO1FBQ3BELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDO1FBQzlDLGVBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw4REFBOEQsRUFBRTtZQUMxRSxHQUFHLFNBQVMsSUFBSSxDQUFDO2dCQUNiLGtCQUFrQixFQUFFO29CQUNoQixZQUFZLEVBQUUsU0FBUztvQkFDdkIsNkJBQTZCLEVBQUUsSUFBSTtpQkFDdEM7YUFDSixDQUFDO1NBQ0wsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFckIsTUFBTSxLQUFLLEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNwRSxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsd0NBQXdDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFLO1FBQ2QsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRXhCLGVBQU0sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxXQUFXLENBQUMscUZBQXFGLENBQUMsQ0FBQztZQUMzRyxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUU7WUFDM0MsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsZUFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBL0RELHdDQStEQyJ9