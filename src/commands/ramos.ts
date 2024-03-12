import { Command, CommandContext, TelegramClient } from '../lib';

export default class RamosCommand extends Command<[]> {
    public constructor(client: TelegramClient) {
        super(client, {
            name: 'ramos',
            description: 'Ramos del curso.',
        });
    }

    public async run(context: CommandContext): Promise<void> {
        context;
    }
}
