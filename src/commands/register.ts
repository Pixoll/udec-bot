import { Command, CommandContext, TelegramClient } from '../lib';

export default class RegisterCommand extends Command<[]> {
    public constructor(client: TelegramClient) {
        super(client, {
            name: 'register',
            description: 'Registra tu curso.',
        });
    }

    public async run(context: CommandContext): Promise<void> {
        context;
    }
}
