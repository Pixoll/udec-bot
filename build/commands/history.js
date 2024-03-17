"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const util_1 = require("../util");
class HistoryCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'history',
            description: 'Historial de acciones en el grupo.',
            groupOnly: true,
        });
    }
    async run(context) {
        const query = await this.client.db.select('udec_actions_history', builder => builder.where({
            column: 'chat_id',
            equals: context.chat.id,
        }));
        if (!query.ok || query.result.length === 0) {
            await context.fancyReply('El historial de acciones está vacío.');
            return;
        }
        const history = query.result.map(record => `• ${record.type} << ${record.username}`).join('\n');
        await context.fancyReply((0, util_1.stripIndent)(`
        👁️ *Historial resumido de acciones:*

        ${history}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}
exports.default = HistoryCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9oaXN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0NBQWlFO0FBQ2pFLGtDQUFzQztBQUV0QyxNQUFxQixjQUFlLFNBQVEsYUFBVztJQUluRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsb0NBQW9DO1lBQ2pELFNBQVMsRUFBRSxJQUFJO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUN2RixNQUFNLEVBQUUsU0FBUztZQUNqQixNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1NBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ0osSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDekMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDakUsT0FBTztRQUNYLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUN0QyxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUMzQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUViLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFBLGtCQUFXLEVBQUM7OztVQUduQyxPQUFPO1NBQ1IsQ0FBQyxFQUFFO1lBQ0EsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBbENELGlDQWtDQyJ9