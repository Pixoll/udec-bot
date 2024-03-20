"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const util_1 = require("../util");
const args = [{
        key: 'amount',
        label: 'cantidad',
        prompt: 'Número de acciones a mostrar.',
        type: lib_1.ArgumentType.Number,
        min: 1,
    }];
class HistoryCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'history',
            description: 'Historial de acciones en el grupo.',
            groupOnly: true,
            args,
        });
    }
    async run(context, { amount }) {
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
            .map(record => `• \`${(0, lib_1.dateToString)(record.timestamp, true)}\` \\- ${record.type} \\- ${(0, util_1.escapeMarkdown)(record.username)}`)
            .join('\n');
        const footer = !amount
            ? `Usa \`/${this.name} <${args[0].label}>\` para mostrar una cantidad específica de acciones\\.`
            : '';
        await context.fancyReply((0, util_1.stripIndent)(`
        👁️ *Historial de acciones:*

        ${history}

        ${footer}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}
exports.default = HistoryCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9oaXN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0NBUWdCO0FBQ2hCLGtDQUFzRDtBQUV0RCxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixLQUFLLEVBQUUsVUFBVTtRQUNqQixNQUFNLEVBQUUsK0JBQStCO1FBQ3ZDLElBQUksRUFBRSxrQkFBWSxDQUFDLE1BQU07UUFDekIsR0FBRyxFQUFFLENBQUM7S0FDVCxDQUFzQyxDQUFDO0FBS3hDLE1BQXFCLGNBQWUsU0FBUSxhQUFnQjtJQUl4RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsb0NBQW9DO1lBQ2pELFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxNQUFNLEVBQWM7UUFDNUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ3ZGLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7U0FDMUIsQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN6QyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUNqRSxPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNO2FBQ3ZCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUM3RCxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQzthQUN2QyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FDVixPQUFPLElBQUEsa0JBQVksRUFBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLE1BQU0sQ0FBQyxJQUFJLFFBQVEsSUFBQSxxQkFBYyxFQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUM1RzthQUNBLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoQixNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU07WUFDbEIsQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyx5REFBeUQ7WUFDaEcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUVULE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFBLGtCQUFXLEVBQUM7OztVQUduQyxPQUFPOztVQUVQLE1BQU07U0FDUCxDQUFDLEVBQUU7WUFDQSxZQUFZLEVBQUUsWUFBWTtTQUM3QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUE3Q0QsaUNBNkNDIn0=