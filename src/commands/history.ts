import { TelegramClientType } from '../client';
import {
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
    Command,
    CommandContext,
    TelegramClient,
    dateToString,
} from '../lib';
import { escapeMarkdown, stripIndent } from '../util';

const args = [{
    key: 'amount',
    label: 'cantidad',
    prompt: 'Número de acciones a mostrar.',
    type: ArgumentType.Number,
    min: 1,
}] as const satisfies ArgumentOptions[];

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

export default class HistoryCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'history',
            description: 'Historial de acciones en el grupo.',
            groupOnly: true,
            args,
        });
    }

    public async run(context: CommandContext, { amount }: ArgsResult): Promise<void> {
        const query = await this.client.db.select('udec_actions_history', builder => builder.where({
            column: 'chat_id',
            equals: context.chat.id,
        }));
        if (!query.ok || query.result.length === 0) {
            await context.fancyReply('El historial de acciones está vacío.');
            return;
        }

        const history = query.result
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, amount ?? query.result.length)
            .map(record =>
                `• \`${dateToString(record.timestamp, true)}\` \\- ${record.type} \\- ${escapeMarkdown(record.username)}`
            )
            .join('\n');

        const footer = !amount
            ? `Usa \`/${this.name} <${args[0].label}>\` para mostrar una cantidad específica de acciones\\.`
            : '';

        await context.fancyReply(stripIndent(`
        👁️ *Historial de acciones:*

        ${history}

        ${footer}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}
