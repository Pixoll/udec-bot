"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
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
        await (0, util_1.clearOldAssignments)(client_1.client);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvY2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBdUQ7QUFDdkQsZ0NBVWdCO0FBQ2hCLGtDQU9pQjtBQUVqQixNQUFNLGNBQWMsR0FBRyxDQUFDO1FBQ3BCLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLENBQUM7S0FDZixFQUFFO1FBQ0MsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsQ0FBQztLQUNmLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxFQUFFO0tBQ2hCLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxFQUFFO0tBQ2hCLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxRQUFRO0tBQ3RCLENBQW9DLENBQUM7QUFFdEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLE1BQU07UUFDYixNQUFNLEVBQUUscURBQXFEO1FBQzdELElBQUksRUFBRSxrQkFBWSxDQUFDLE1BQU07UUFDekIsR0FBRyxFQUFFLEdBQUc7UUFDUixPQUFPLEVBQUUsRUFBRSxHQUFHLDZCQUFzQjtRQUNwQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDeEIsS0FBSyxDQUFDLEtBQUs7WUFDUCxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyw2QkFBc0IsQ0FBQztRQUNwRCxDQUFDO0tBQ29ELENBQVUsQ0FBQztBQVdwRSxNQUFxQixZQUFhLFNBQVEsYUFBZ0I7SUFJdEQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7U0FDUCxDQUFDLENBQUM7SUFD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