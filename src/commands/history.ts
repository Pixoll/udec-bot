import { TelegramClientType } from '../client';
import { Command, CommandContext, TelegramClient } from '../lib';

export default class HistoryCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'history',
            description: 'Historial de acciones de /certs.',
            groupOnly: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        context;
    }
}
