import { TelegramClientType } from '../client';
import { Command, CommandContext, TelegramClient } from '../lib';

const sourceUrl = 'https://github.com/Pixoll/udec-bot';

export default class SourceCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'source',
            description: 'Vínculo al código fuente.',
        });
    }

    public async run(context: CommandContext): Promise<void> {
        await context.fancyReply(`[Código fuente](${sourceUrl})`);
    }
}
