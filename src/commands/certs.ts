import { Command, CommandContext, TelegramClient } from '../lib';

export default class CertsCommand extends Command<[]> {
    public constructor(client: TelegramClient) {
        super(client, {
            name: 'certs',
            description: 'Próximas evaluaciones.',
        });
    }

    public async run(context: CommandContext): Promise<void> {
        context;
    }
}
