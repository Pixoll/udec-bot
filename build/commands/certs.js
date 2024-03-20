"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const util_1 = require("../util");
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
        prompt: (0, lib_1.escapeMarkdown)('Ingrese la cantidad de días en el futuro a mostrar.'),
        type: lib_1.ArgumentType.Number,
        max: 120,
        default: 45 * util_1.daysMsConversionFactor,
        example: (0, lib_1.escapeMarkdown)('Ejemplo: `/certs 120`.', '`'),
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
        const assignments = query.result
            .sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map(a => {
            const daysUntil = (0, util_1.getDaysUntil)(a.date_due);
            const marker = dueDateMarkers.find(m => daysUntil <= m.threshold);
            return `• ${marker.emoji} *${(0, lib_1.capitalize)(a.type)}* \\- _${(0, util_1.daysUntilToString)(daysUntil)}_\n`
                + `*\\[${a.subject_code}\\] ${a.subject_name}*`;
        })
            .join('\n\n');
        await context.fancyReply((0, util_1.stripIndent)(`
        ✳️ *Fechas Relevantes* ✳️
        \\~ Rango: ${Math.floor(days / util_1.daysMsConversionFactor)} días

        ${assignments}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}
exports.default = CertsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvY2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxnQ0FTZ0I7QUFDaEIsa0NBQStGO0FBRS9GLE1BQU0sY0FBYyxHQUFHLENBQUM7UUFDcEIsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsQ0FBQztLQUNmLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxDQUFDO0tBQ2YsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLEVBQUU7S0FDaEIsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLEVBQUU7S0FDaEIsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLFFBQVE7S0FDdEIsQ0FBb0MsQ0FBQztBQUV0QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsTUFBTTtRQUNiLE1BQU0sRUFBRSxJQUFBLG9CQUFjLEVBQUMscURBQXFELENBQUM7UUFDN0UsSUFBSSxFQUFFLGtCQUFZLENBQUMsTUFBTTtRQUN6QixHQUFHLEVBQUUsR0FBRztRQUNSLE9BQU8sRUFBRSxFQUFFLEdBQUcsNkJBQXNCO1FBQ3BDLE9BQU8sRUFBRSxJQUFBLG9CQUFjLEVBQUMsd0JBQXdCLEVBQUUsR0FBRyxDQUFDO1FBQ3RELEtBQUssQ0FBQyxLQUFLO1lBQ1AsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsNkJBQXNCLENBQUMsQ0FBQyxhQUFhO1FBQ2xFLENBQUM7S0FDb0QsQ0FBVSxDQUFDO0FBVXBFLE1BQXFCLFlBQWEsU0FBUSxhQUFnQjtJQUl0RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE9BQU87WUFDYixXQUFXLEVBQUUsd0JBQXdCO1lBQ3JDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDMUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPO2FBQzNFLEtBQUssQ0FBQztZQUNILE1BQU0sRUFBRSxTQUFTO1lBQ2pCLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7U0FDMUIsQ0FBQzthQUNELEtBQUssQ0FBQztZQUNILE1BQU0sRUFBRSxVQUFVO1lBQ2xCLGlCQUFpQixFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7U0FDakQsQ0FBQyxDQUNMLENBQUM7UUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN6QyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBQSxrQkFBVyxFQUFDOzs7O2FBSXBDLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztRQUNYLENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTTthQUMzQixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDM0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ0wsTUFBTSxTQUFTLEdBQUcsSUFBQSxtQkFBWSxFQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQyxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQWtCLENBQUM7WUFDbkYsT0FBTyxLQUFLLE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBQSxnQkFBVSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFBLHdCQUFpQixFQUFDLFNBQVMsQ0FBQyxLQUFLO2tCQUNwRixPQUFPLENBQUMsQ0FBQyxZQUFZLE9BQU8sQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDO1FBQ3hELENBQUMsQ0FBQzthQUNELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVsQixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBQSxrQkFBVyxFQUFDOztxQkFFeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsNkJBQXNCLENBQUM7O1VBRXBELFdBQVc7U0FDWixDQUFDLEVBQUU7WUFDQSxZQUFZLEVBQUUsWUFBWTtTQUM3QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFwREQsK0JBb0RDIn0=