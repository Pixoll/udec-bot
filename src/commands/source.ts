import { TelegramClientType } from '../client';
import { Command, CommandContext, TelegramClient } from '../lib';
import packageJson from '../package';
import { stripIndent } from '../util';

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
        await context.fancyReply(stripIndent(`
        *UdeC Bot v${packageJson.version}*

        Código fuente: [GitHub](${packageJson.repository.url})
        `).replace(/[.-]/g, '\\$&'), {
            'link_preview_options': {
                'is_disabled': false,
            },
        });
    }
}
