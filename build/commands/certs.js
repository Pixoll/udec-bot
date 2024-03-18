"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const util_1 = require("../util");
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
    }];
const args = [{
        key: 'days',
        label: 'días',
        description: 'Cantidad de días en el futuro a mostrar.',
        type: lib_1.ArgumentType.Number,
        max: 120,
        default: 3_888_000_000, // 45 days
        parse(value) {
            return parseInt(value) * daysMsConversionFactor; // days -> ms
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
        const assignments = query.result.map(a => {
            const daysUntil = getDaysUntil(a.date_due);
            const marker = dueDateMarkers.find(m => daysUntil <= m.threshold);
            return `• ${marker.emoji} _${daysUntil} día${daysUntil === 1 ? '' : 's'} \\(${(0, lib_1.capitalize)(a.type)}\\)_\n`
                + `*\\[${a.subject_code}\\] ${a.subject_name}*`;
        }).join('\n\n');
        await context.fancyReply((0, util_1.stripIndent)(`
        ✳️ *Fechas Relevantes* ✳️
        \\~ Rango: ${Math.floor(days / daysMsConversionFactor)} días

        ${assignments}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}
exports.default = CertsCommand;
function getDaysUntil(date) {
    return Math.floor((date.getTime() - Date.now()) / daysMsConversionFactor);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvY2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxnQ0FRZ0I7QUFDaEIsa0NBQXNDO0FBRXRDLE1BQU0sc0JBQXNCLEdBQUcsVUFBVSxDQUFDO0FBRTFDLE1BQU0sY0FBYyxHQUFHLENBQUM7UUFDcEIsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsQ0FBQztLQUNmLEVBQUU7UUFDQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFNBQVMsRUFBRSxDQUFDO0tBQ2YsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLEVBQUU7S0FDaEIsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLEVBQUU7S0FDaEIsRUFBRTtRQUNDLEtBQUssRUFBRSxJQUFJO1FBQ1gsU0FBUyxFQUFFLFFBQVE7S0FDdEIsQ0FBb0MsQ0FBQztBQUV0QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsTUFBTTtRQUNiLFdBQVcsRUFBRSwwQ0FBMEM7UUFDdkQsSUFBSSxFQUFFLGtCQUFZLENBQUMsTUFBTTtRQUN6QixHQUFHLEVBQUUsR0FBRztRQUNSLE9BQU8sRUFBRSxhQUFhLEVBQUUsVUFBVTtRQUNsQyxLQUFLLENBQUMsS0FBSztZQUNQLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUMsYUFBYTtRQUNsRSxDQUFDO0tBQ29ELENBQVUsQ0FBQztBQVVwRSxNQUFxQixZQUFhLFNBQVEsYUFBZ0I7SUFJdEQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1lBQ2IsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFjO1FBQzFELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTzthQUMzRSxLQUFLLENBQUM7WUFDSCxNQUFNLEVBQUUsU0FBUztZQUNqQixNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1NBQzFCLENBQUM7YUFDRCxLQUFLLENBQUM7WUFDSCxNQUFNLEVBQUUsVUFBVTtZQUNsQixpQkFBaUIsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQ2pELENBQUMsQ0FDTCxDQUFDO1FBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDekMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUEsa0JBQVcsRUFBQzs7OzthQUlwQyxDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDckMsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQyxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQWtCLENBQUM7WUFDbkYsT0FBTyxLQUFLLE1BQU0sQ0FBQyxLQUFLLEtBQUssU0FBUyxPQUFPLFNBQVMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVE7a0JBQ2xHLE9BQU8sQ0FBQyxDQUFDLFlBQVksT0FBTyxDQUFDLENBQUMsWUFBWSxHQUFHLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWhCLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFBLGtCQUFXLEVBQUM7O3FCQUV4QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxzQkFBc0IsQ0FBQzs7VUFFcEQsV0FBVztTQUNaLENBQUMsRUFBRTtZQUNBLFlBQVksRUFBRSxZQUFZO1NBQzdCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWpERCwrQkFpREM7QUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFVO0lBQzVCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzlFLENBQUMifQ==