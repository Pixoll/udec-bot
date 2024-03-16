import { readFileSync } from 'fs';
import path from 'path';
import { TelegramClientType } from '../client';
import { Command, CommandContext, TelegramClient } from '../lib';
import { stripIndent } from '../util';

const packageJson = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')) as PackageJson;

interface PackageJson {
    readonly name: string;
    readonly version: string;
    readonly author: string;
    readonly license: string;
    readonly description: string;
    readonly repository: {
        readonly url: string;
    };
}

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
            'parse_mode': 'MarkdownV2',
            'link_preview_options': {
                'is_disabled': false,
            },
        });
    }
}
