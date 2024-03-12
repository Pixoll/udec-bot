import { Context, Telegraf } from 'telegraf';
import { ClientRegistry } from './registry';
import path from 'path';
import { omit } from './util';
import { Logger } from './logger';

export class TelegramClient extends Telegraf implements Omit<TelegramClientOptions, 'commandsDir'> {
    public declare readonly ownerId: number | null;
    public readonly registry: ClientRegistry;
    private ready: boolean;
    private declare runBeforeLogin: () => unknown;

    public constructor(options: TelegramClientOptions) {
        const { TELEGRAM_TOKEN } = process.env;
        if (!TELEGRAM_TOKEN) {
            throw new Error('A TELEGRAM_TOKEN env. variable must be specified.');
        }

        super(TELEGRAM_TOKEN);

        Object.assign(this, omit(options, ['commandsDir']));

        this.ready = false;
        Logger.info('Registering commands and type handlers...');
        this.registry = new ClientRegistry(this);
        this.registry.registerTypeHandlersIn(path.join(__dirname, './types'), 'base')
            .registerCommandsIn(options.commandsDir);

        this.catch((...args) => this.catchError(...args));
    }

    public async catchError(error: unknown, context: Context): Promise<void> {
        const messageId = context.message?.message_id;
        Logger.error(error);
        context.reply('Ocurrió un error y ha sido notificado al mantenedor del bot.', {
            ...messageId && ({
                'reply_parameters': {
                    'message_id': messageId,
                    'allow_sending_without_reply': true,
                },
            }),
        });

        const { ownerId } = this;
        if (!ownerId) return;

        const stack = error instanceof Error ? error.stack ?? error : error;
        context.telegram.sendMessage(ownerId,`An unexpected error has occurred:\n\n${stack}`);
    }

    public beforeLogin(fn: () => unknown): this {
        this.runBeforeLogin = fn;
        return this;
    }

    public async login(): Promise<void> {
        await this.runBeforeLogin?.();

        Logger.info('Starting Telegram Client...');
        if (this.ready) {
            process.emitWarning('Telegram Client has been already launched. Make sure to only call this method once.');
            return;
        }

        this.launch({ dropPendingUpdates: true }, () => {
            this.ready = true;
            Logger.info('Telegram Client is ready.');
        });
    }
}

export interface TelegramClientOptions {
    readonly commandsDir: string;
    readonly ownerId: number | null;
}
