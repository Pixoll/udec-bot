import { TelegramClientType } from '../client';
import { Command, CommandContext, TelegramClient } from '../lib';

export default class CertsCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'certs',
            description: 'Próximas evaluaciones.',
            groupOnly: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        context;
    }
}
