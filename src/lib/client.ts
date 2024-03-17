import { Context, Telegraf } from 'telegraf';
import { ClientRegistry } from './registry';
import path from 'path';
import { omit } from './util';
import { Logger } from './logger';
import { Database, DatabaseOptions, TablesArray } from './db';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export class TelegramClient<Tables extends TablesArray = []>
    extends Telegraf
    implements Omit<TelegramClientOptions<Tables>, 'commandsDir' | 'db'> {
    public declare readonly ownerId: number | null;
    public readonly registry: ClientRegistry;
    public readonly db: Database<Tables>;
    private ready: boolean;

    public constructor(options: TelegramClientOptions<Tables>) {
        const { TELEGRAM_TOKEN } = process.env;
        if (!TELEGRAM_TOKEN) {
            throw new Error('A TELEGRAM_TOKEN env. variable must be specified.');
        }

        super(TELEGRAM_TOKEN);

        Object.assign(this, omit(options, ['commandsDir', 'db']));

        this.db = new Database<Tables>(options.db);

        this.ready = false;
        Logger.info('Registering commands and type handlers...');
        this.registry = new ClientRegistry(this as unknown as TelegramClient<[]>);
        this.registry.registerTypeHandlersIn(path.join(__dirname, './types'), 'base')
            .registerCommandsIn(options.commandsDir);

        this.catch((...args) => this.catchError(...args));
    }

    public async catchError(error: unknown, context: Context, extra: ExtraReplyMessage = {}): Promise<void> {
        const messageId = context.message?.message_id;
        Logger.error(error);
        context.reply('Ocurrió un error y ha sido notificado al mantenedor del bot.', {
            ...messageId && ({
                'reply_parameters': {
                    'message_id': messageId,
                    'allow_sending_without_reply': true,
                },
            }),
            ...extra,
        });

        const { ownerId } = this;
        if (!ownerId) return;

        const stack = error instanceof Error ? error.stack ?? error : error;
        context.telegram.sendMessage(ownerId, `An unexpected error has occurred:\n\n${stack}`);
    }

    public async login(): Promise<void> {
        await this.db.connect();

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

export interface TelegramClientOptions<Tables extends TablesArray> {
    readonly commandsDir: string;
    readonly ownerId: number | null;
    readonly db: DatabaseOptions<Tables>;
}
