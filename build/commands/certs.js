"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const util_1 = require("../util");
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
    }];
const args = [{
        key: "days",
        label: "días",
        prompt: "Ingrese la cantidad de días en el futuro a mostrar.",
        type: lib_1.ArgumentType.Number,
        max: 120,
        default: 45 * util_1.daysMsConversionFactor,
        examples: ["/certs 120"],
        parse(value) {
            return parseInt(value) * util_1.daysMsConversionFactor;
        },
    }];
class CertsCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: "certs",
            description: "Próximas evaluaciones.",
            groupOnly: true,
            args,
        });
    }
    async run(context, { days }) {
        const queryAssignments = await this.client.db
            .selectFrom("udec_assignment as assignment")
            .innerJoin("udec_subject as subject", "assignment.subject_code", "subject.code")
            .select(["subject_code", "name as subject_name", "date_due", "type"])
            .where("chat_id", "=", `${context.chat.id}`)
            .where("date_due", "<=", (0, util_1.dateStringToSqlDate)((0, lib_1.dateToString)(new Date(Date.now() + days))))
            .execute();
        if (queryAssignments.length === 0) {
            await context.fancyReply((0, util_1.stripIndent)(`
            No hay ninguna evaluación registrada para este grupo.

            Usa /addcert para añadir una.
            `));
            return;
        }
        const assignments = queryAssignments
            .map(a => ({
            ...a,
            date_due: (0, lib_1.dateAtSantiago)(a.date_due),
        }))
            .sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map((a) => {
            const daysUntil = (0, util_1.getDaysUntil)(a.date_due);
            const marker = dueDateMarkers.find(m => daysUntil <= m.threshold);
            return `• ${marker.emoji} *${(0, lib_1.capitalize)(a.type)}* \\- `
                + `_${(0, util_1.daysUntilToString)(daysUntil)} \\(${(0, lib_1.dateToString)(a.date_due)}\\)_\n`
                + `*\\[${a.subject_code}\\] ${a.subject_name ?? "ERROR"}*`;
        });
        await context.fancyReply((0, util_1.stripIndent)(`
        ✳️ *Fechas Relevantes* ✳️
        \\~ Rango: ${Math.floor(days / util_1.daysMsConversionFactor)} días

        ${assignments.join("\n\n")}
        `), {
            "parse_mode": "MarkdownV2",
        });
    }
}
exports.default = CertsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvY2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxnQ0FVZ0I7QUFDaEIsa0NBQW9IO0FBRXBILE1BQU0sY0FBYyxHQUFHLENBQUM7UUFDcEIsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsQ0FBQztLQUNmLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxDQUFDO0tBQ2YsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLEVBQUU7S0FDaEIsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLEVBQUU7S0FDaEIsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLFFBQVE7S0FDdEIsQ0FBb0MsQ0FBQztBQUV0QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsTUFBTTtRQUNiLE1BQU0sRUFBRSxxREFBcUQ7UUFDN0QsSUFBSSxFQUFFLGtCQUFZLENBQUMsTUFBTTtRQUN6QixHQUFHLEVBQUUsR0FBRztRQUNSLE9BQU8sRUFBRSxFQUFFLEdBQUcsNkJBQXNCO1FBQ3BDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQztRQUN4QixLQUFLLENBQUMsS0FBSztZQUNQLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLDZCQUFzQixDQUFDO1FBQ3BELENBQUM7S0FDb0QsQ0FBVSxDQUFDO0FBV3BFLE1BQXFCLFlBQWEsU0FBUSxhQUFnQjtJQUl0RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixXQUFXLEVBQUUsd0JBQXdCO1lBQ3JDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxL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