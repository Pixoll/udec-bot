import { TelegramClientType } from "../client";
import {
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
    Command,
    CommandContext,
    TelegramClient,
    capitalize,
    dateAtSantiago,
    dateToString,
} from "../lib";
import { daysMsConversionFactor, daysUntilToString, getDaysUntil, stripIndent } from "../util";

const dueDateMarkers = [{
    emoji: "🏳",
    threshold: 2,
}, {
    emoji: "🔴",
    threshold: 7,
}, {
    emoji: "🟠",
    threshold: 14,
}, {
    emoji: "🟡",
    threshold: 21,
}, {
    emoji: "🟢",
    threshold: Infinity,
}] as const satisfies DueDateMarker[];

const args = [{
    key: "days",
    label: "días",
    prompt: "Ingrese la cantidad de días en el futuro a mostrar.",
    type: ArgumentType.Number,
    max: 120,
    default: 45 * daysMsConversionFactor,
    examples: ["/certs 120"],
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
            name: "certs",
            description: "Próximas evaluaciones.",
            groupOnly: true,
            args,
        });
    }

    public async run(context: CommandContext, { days }: ArgsResult): Promise<void> {
        const queryAssignments = await this.client.db
            .selectFrom("udec_assignment as assignment")
            .innerJoin("udec_subject as subject", "assignment.subject_code", "subject.code")
            .select(["subject_code", "name as subject_name", "date_due", "type"])
            .where("chat_id", "=", `${context.chat.id}`)
            .where("date_due", ">=", dateToString(new Date(Date.now() + days)))
            .execute();

        if (queryAssignments.length === 0) {
            await context.fancyReply(stripIndent(`
            No hay ninguna evaluación registrada para este grupo.

            Usa /addcert para añadir una.
            `));
            return;
        }

        const assignments = queryAssignments
            .map(a => ({ ...a, date_due: dateAtSantiago(a.date_due) }))
            .sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map((a) => {
                const daysUntil = getDaysUntil(a.date_due);
                const marker = dueDateMarkers.find(m => daysUntil <= m.threshold) as DueDateMarker;
                return `• ${marker.emoji} *${capitalize(a.type)}* \\- `
                    + `_${daysUntilToString(daysUntil)} \\(${dateToString(a.date_due)}\\)_\n`
                    + `*\\[${a.subject_code}\\] ${a.subject_name ?? "ERROR"}*`;
            });

        await context.fancyReply(stripIndent(`
        ✳️ *Fechas Relevantes* ✳️
        \\~ Rango: ${Math.floor(days / daysMsConversionFactor)} días

        ${assignments.join("\n\n")}
        `), {
            "parse_mode": "MarkdownV2",
        });
    }
}
