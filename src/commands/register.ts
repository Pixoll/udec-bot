import { TelegramClientType } from '../client';
import { Command, CommandContext, TelegramClient } from '../lib';

export default class RegisterCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'register',
            description: 'Registra tu chat grupal.',
            groupOnly: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        context;
    }
}
