import { TelegramClientType } from '../client';
import { Command, CommandContext, TelegramClient } from '../lib';
import { stripIndent } from '../util';

export default class HistoryCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'history',
            description: 'Historial de acciones en el grupo.',
            groupOnly: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const query = await this.client.db.select('udec_actions_history', builder => builder.where({
            column: 'chat_id',
            equals: context.chat.id,
        }));
        if (!query.ok || query.result.length === 0) {
            await context.fancyReply('El historial de acciones está vacío.');
            return;
        }

        const history = query.result.map(record =>
            `• ${record.type} << ${record.username}`
        ).join('\n');

        await context.fancyReply(stripIndent(`
        👁️ *Historial resumido de acciones:*

        ${history}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}
