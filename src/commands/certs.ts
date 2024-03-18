import { TelegramClientType } from '../client';
import {
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
    Command,
    CommandContext,
    TelegramClient,
    capitalize,
} from '../lib';
import { stripIndent } from '../util';

const daysMsConversionFactor = 86_400_000;

const dueDateMarkers = [{
    emoji: '🏳',
    threshold: 2,
}, {
    emoji: '🔴',
    threshold: 7,
}, {
    emoji: '🟠',
    threshold: 14,
}, {
    emoji: '🟡',
    threshold: 21,
}, {
    emoji: '🟢',
    threshold: Infinity,
}] as const satisfies DueDateMarker[];

const args = [{
    key: 'days',
    label: 'días',
    description: 'Cantidad de días en el futuro a mostrar.',
    type: ArgumentType.Number,
    max: 120,
    default: 3_888_000_000, // 45 days
    parse(value): number {
        return parseInt(value) * daysMsConversionFactor; // days -> ms
    },
} as const satisfies ArgumentOptions<ArgumentType.Number>] as const;

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

interface DueDateMarker {
    emoji: string;
    threshold: number;
}

export default class CertsCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'certs',
            description: 'Próximas evaluaciones.',
            groupOnly: true,
            args,
        });
    }

    public async run(context: CommandContext, { days }: ArgsResult): Promise<void> {
        const query = await this.client.db.select('udec_assignments', builder => builder
            .where({
                column: 'chat_id',
                equals: context.chat.id,
            })
            .where({
                column: 'date_due',
                lessThanOrEqualTo: new Date(Date.now() + days),
            })
        );
        if (!query.ok || query.result.length === 0) {
            await context.fancyReply(stripIndent(`
            No hay ninguna evaluación registrada para este grupo.

            Usa /addcert para añadir una.
            `));
            return;
        }

        const assignments = query.result.map(a => {
            const daysUntil = getDaysUntil(a.date_due);
            const marker = dueDateMarkers.find(m => daysUntil <= m.threshold) as DueDateMarker;
            return `• ${marker.emoji} _${daysUntil} día${daysUntil === 1 ? '' : 's'} \\(${capitalize(a.type)}\\)_\n`
                + `*\\[${a.subject_code}\\] ${a.subject_name}*`;
        }).join('\n\n');

        await context.fancyReply(stripIndent(`
        ✳️ *Fechas Relevantes* ✳️
        \\~ Rango: ${Math.floor(days / daysMsConversionFactor)} días

        ${assignments}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}

function getDaysUntil(date: Date): number {
    return Math.floor((date.getTime() - Date.now()) / daysMsConversionFactor);
}
