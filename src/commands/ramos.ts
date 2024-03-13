import { TelegramClientType } from '../client';
import { Command, CommandContext, TelegramClient } from '../lib';

export default class RamosCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

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
