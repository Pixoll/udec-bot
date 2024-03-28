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
import { daysMsConversionFactor, daysUntilToString, getDaysUntil, stripIndent } from '../util';

const subjectNames = new Map<number, string>();

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
    prompt: 'Ingrese la cantidad de días en el futuro a mostrar.',
    type: ArgumentType.Number,
    max: 120,
    default: 45 * daysMsConversionFactor,
    examples: ['/certs 120'],
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

        const assignments = await Promise.all(query.result
            .sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map(async (a) => {
                const subjectName = await getSubjectName(this.client.db, a.subject_code, context.chat.id);
                const daysUntil = getDaysUntil(a.date_due);
                const marker = dueDateMarkers.find(m => daysUntil <= m.threshold) as DueDateMarker;
                return `• ${marker.emoji} *${capitalize(a.type)}* \\- _${daysUntilToString(daysUntil)}_\n`
                    + `*\\[${a.subject_code}\\] ${subjectName ?? 'ERROR'}*`;
            }));

        await context.fancyReply(stripIndent(`
        ✳️ *Fechas Relevantes* ✳️
        \\~ Rango: ${Math.floor(days / daysMsConversionFactor)} días

        ${assignments.join('\n\n')}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}

export async function getSubjectName(db: TelegramClientType['db'], code: number, chatId: number): Promise<string | null> {
    const existing = subjectNames.get(code);
    if (existing) return existing;

    const query = await db.select('udec_subjects', builder => builder
        .where({
            column: 'chat_id',
            equals: chatId,
        })
        .where({
            column: 'code',
            equals: code,
        })
    );

    const result = query.ok ? query.result[0]?.name ?? null : null;
    if (result) subjectNames.set(code, result);

    return result;
}
