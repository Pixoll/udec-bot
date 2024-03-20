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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvY2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxnQ0FTZ0I7QUFDaEIsa0NBQStGO0FBRS9GLE1BQU0sY0FBYyxHQUFHLENBQUM7UUFDcEIsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsQ0FBQztLQUNmLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxDQUFDO0tBQ2YsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLEVBQUU7S0FDaEIsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLEVBQUU7S0FDaEIsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLFFBQVE7S0FDdEIsQ0FBb0MsQ0FBQztBQUV0QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsTUFBTTtRQUNiLE1BQU0sRUFBRSxJQUFBLG9CQUFjLEVBQUMscURBQXFELENBQUM7UUFDN0UsSUFBSSxFQUFFLGtCQUFZLENBQUMsTUFBTTtRQUN6QixHQUFHLEVBQUUsR0FBRztRQUNSLE9BQU8sRUFBRSxFQUFFLEdBQUcsNkJBQXNCO1FBQ3BDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQztRQUN4QixLQUFLLENBQUMsS0FBSztZQUNQLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLDZCQUFzQixDQUFDLENBQUMsYUFBYTtRQUNsRSxDQUFDO0tBQ29ELENBQVUsQ0FBQztBQVVwRSxNQUFxQixZQUFhLFNBQVEsYUFBZ0I7SUFJdEQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFjO1FBQzFELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTzthQUMzRSxLQUFLLENBQUM7WUFDSCxNQUFNLEVBQUUsU0FBUztZQUNqQixNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1NBQzFCLENBQUM7YUFDRCxLQUFLLENBQUM7WUFDSCxNQUFNLEVBQUUsVUFBVTtZQUNsQixpQkFBaUIsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQ2pELENBQUMsQ0FDTCxDQUFDO1FBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDekMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUEsa0JBQVcsRUFBQzs7OzthQUlwQyxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU07YUFDM0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzNELEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNMLE1BQU0sU0FBUyxHQUFHLElBQUEsbUJBQVksRUFBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0MsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFrQixDQUFDO1lBQ25GLE9BQU8sS0FBSyxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBQSx3QkFBaUIsRUFBQyxTQUFTLENBQUMsS0FBSztrQkFDcEYsT0FBTyxDQUFDLENBQUMsWUFBWSxPQUFPLENBQUMsQ0FBQyxZQUFZLEdBQUcsQ0FBQztRQUN4RCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbEIsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUEsa0JBQVcsRUFBQzs7cUJBRXhCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLDZCQUFzQixDQUFDOztVQUVwRCxXQUFXO1NBQ1osQ0FBQyxFQUFFO1lBQ0EsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBcERELCtCQW9EQyJ9