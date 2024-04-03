"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjectName = void 0;
const lib_1 = require("../lib");
const util_1 = require("../util");
const subjectNames = new Map();
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
    }];
const args = [{
        key: 'days',
        label: 'días',
        prompt: 'Ingrese la cantidad de días en el futuro a mostrar.',
        type: lib_1.ArgumentType.Number,
        max: 120,
        default: 45 * util_1.daysMsConversionFactor,
        examples: ['/certs 120'],
        parse(value) {
            return parseInt(value) * util_1.daysMsConversionFactor; // days -> ms
        },
    }];
class CertsCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'certs',
            description: 'Próximas evaluaciones.',
            groupOnly: true,
            args,
        });
    }
    async run(context, { days }) {
        const query = await this.client.db.select('udec_assignments', builder => builder
            .where({
            column: 'chat_id',
            equals: context.chat.id,
        })
            .where({
            column: 'date_due',
            lessThanOrEqualTo: new Date(Date.now() + days),
        }));
        if (!query.ok || query.result.length === 0) {
            await context.fancyReply((0, util_1.stripIndent)(`
            No hay ninguna evaluación registrada para este grupo.

            Usa /addcert para añadir una.
            `));
            return;
        }
        const assignments = await Promise.all(query.result
            .sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map(async (a) => {
            const subjectName = await getSubjectName(this.client.db, a.subject_code, context.chat.id);
            const daysUntil = (0, util_1.getDaysUntil)(a.date_due);
            const marker = dueDateMarkers.find(m => daysUntil <= m.threshold);
            return `• ${marker.emoji} *${(0, lib_1.capitalize)(a.type)}* \\- `
                + `_${(0, util_1.daysUntilToString)(daysUntil)} \\(${(0, lib_1.dateToString)(a.date_due)}\\)_\n`
                + `*\\[${a.subject_code}\\] ${subjectName ?? 'ERROR'}*`;
        }));
        await context.fancyReply((0, util_1.stripIndent)(`
        ✳️ *Fechas Relevantes* ✳️
        \\~ Rango: ${Math.floor(days / util_1.daysMsConversionFactor)} días

        ${assignments.join('\n\n')}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}
exports.default = CertsCommand;
async function getSubjectName(db, code, chatId) {
    const existing = subjectNames.get(code);
    if (existing)
        return existing;
    const query = await db.select('udec_subjects', builder => builder
        .where({
        column: 'chat_id',
        equals: chatId,
    })
        .where({
        column: 'code',
        equals: code,
    }));
    const result = query.ok ? query.result[0]?.name ?? null : null;
    if (result)
        subjectNames.set(code, result);
    return result;
}
exports.getSubjectName = getSubjectName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvY2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsZ0NBU2dCO0FBQ2hCLGtDQUErRjtBQUUvRixNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztBQUUvQyxNQUFNLGNBQWMsR0FBRyxDQUFDO1FBQ3BCLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLENBQUM7S0FDZixFQUFFO1FBQ0MsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsQ0FBQztLQUNmLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxFQUFFO0tBQ2hCLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxFQUFFO0tBQ2hCLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxRQUFRO0tBQ3RCLENBQW9DLENBQUM7QUFFdEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLE1BQU07UUFDYixNQUFNLEVBQUUscURBQXFEO1FBQzdELElBQUksRUFBRSxrQkFBWSxDQUFDLE1BQU07UUFDekIsR0FBRyxFQUFFLEdBQUc7UUFDUixPQUFPLEVBQUUsRUFBRSxHQUFHLDZCQUFzQjtRQUNwQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDeEIsS0FBSyxDQUFDLEtBQUs7WUFDUCxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyw2QkFBc0IsQ0FBQyxDQUFDLGFBQWE7UUFDbEUsQ0FBQztLQUNvRCxDQUFVLENBQUM7QUFVcEUsTUFBcUIsWUFBYSxTQUFRLGFBQWdCO0lBSXRELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsT0FBTztZQUNiLFdBQVcsRUFBRSx3QkFBd0I7WUFDckMsU0FB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