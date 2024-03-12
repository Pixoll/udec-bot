import { Command, CommandContext, TelegramClient } from '../lib';

const sourceUrl = 'https://github.com/Pixoll/udec-bot';

export default class SourceCommand extends Command<[]> {
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
