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
class TelegramClient extends telegraf_1.Telegraf {
    registry;
    ready;
    constructor(options) {
        const { TELEGRAM_TOKEN } = process.env;
        if (!TELEGRAM_TOKEN) {
            throw new Error('A TELEGRAM_TOKEN env. variable must be specified.');
        }
        super(TELEGRAM_TOKEN);
        Object.assign(this, (0, util_1.omit)(options, ['commandsDir']));
        this.ready = false;
        console.log('Registering commands and type handlers...');
        this.registry = new registry_1.ClientRegistry(this);
        this.registry.registerTypeHandlersIn(path_1.default.join(__dirname, './types'), 'base')
            .registerCommandsIn(options.commandsDir);
        this.catch((...args) => this.catchError(...args));
    }
    async catchError(error, context) {
        const messageId = context.message?.message_id;
        console.error(error);
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
        console.log('Starting Telegram Client...');
        if (this.ready) {
            process.emitWarning('Telegram Client has been already launched. Make sure to only call this method once.');
            return;
        }
        this.launch({ dropPendingUpdates: true }, () => {
            this.ready = true;
            console.log('Telegram Client is ready.');
        });
    }
}
exports.TelegramClient = TelegramClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsdUNBQTZDO0FBQzdDLHlDQUE0QztBQUM1QyxnREFBd0I7QUFDeEIsaUNBQThCO0FBRTlCLE1BQWEsY0FBZSxTQUFRLG1CQUFRO0lBRXhCLFFBQVEsQ0FBaUI7SUFDakMsS0FBSyxDQUFVO0lBRXZCLFlBQW1CLE9BQThCO1FBQzdDLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV0QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEQsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx5QkFBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDO2FBQ3hFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTSxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQWMsRUFBRSxPQUFnQjtRQUNwRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQztRQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsOERBQThELEVBQUU7WUFDMUUsR0FBRyxTQUFTLElBQUksQ0FBQztnQkFDYixrQkFBa0IsRUFBRTtvQkFDaEIsWUFBWSxFQUFFLFNBQVM7b0JBQ3ZCLDZCQUE2QixFQUFFLElBQUk7aUJBQ3RDO2FBQ0osQ0FBQztTQUNMLENBQUMsQ0FBQztRQUVILE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRXJCLE1BQU0sS0FBSyxHQUFHLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDcEUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFDLHdDQUF3QyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxXQUFXLENBQUMscUZBQXFGLENBQUMsQ0FBQztZQUMzRyxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUU7WUFDM0MsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBdkRELHdDQXVEQyJ9