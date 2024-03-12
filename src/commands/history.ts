import { Command, CommandContext, TelegramClient } from '../lib';

export default class HistoryCommand extends Command<[]> {
    public constructor(client: TelegramClient) {
        super(client, {
            name: 'history',
            description: 'Historial de acciones de /certs.',
        });
    }

    public async run(context: CommandContext): Promise<void> {
        context;
    }
}
