"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const util_1 = require("../util");
const args = [{
        key: "amount",
        label: "cantidad",
        prompt: "Ingrese la cantidad de acciones a mostrar.",
        type: lib_1.ArgumentType.Number,
        min: 1,
    }];
class HistoryCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: "history",
            description: "Historial de acciones en el grupo.",
            groupOnly: true,
            args,
        });
    }
    async run(context, { amount }) {
        const actions = await this.client.db
            .selectFrom("udec_action_history")
            .select(["timestamp", "type", "username"])
            .where("chat_id", "=", `${context.chat.id}`)
            .execute();
        if (actions.length === 0) {
            await context.fancyReply("El historial de acciones está vacío.");
            return;
        }
        const history = actions
            .map(a => ({ ...a, timestamp: (0, lib_1.dateAtSantiago)(a.timestamp) }))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, amount ?? actions.length)
            .map(record => `• \`${(0, lib_1.dateToString)(record.timestamp, true)}\` \\- ${record.type} \\- ${(0, lib_1.escapeMarkdown)(record.username)}`)
            .join("\n");
        const footer = !amount
            ? `Usa \`/${this.name} <${args[0].label}>\` para mostrar una cantidad específica de acciones\\.`
            : "";
        await context.fancyReply((0, util_1.stripIndent)(`
        👁️ *Historial de acciones:*

        ${history}

        ${footer}
        `), {
            "parse_mode": "MarkdownV2",
        });
    }
}
exports.default = HistoryCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9oaXN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0NBVWdCO0FBQ2hCLGtDQUFzQztBQUV0QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixLQUFLLEVBQUUsVUFBVTtRQUNqQixNQUFNLEVBQUUsNENBQTRDO1FBQ3BELElBQUksRUFBRSxrQkFBWSxDQUFDLE1BQU07UUFDekIsR0FBRyxFQUFFLENBQUM7S0FDVCxDQUFzQyxDQUFDO0FBS3hDLE1BQXFCLGNBQWUsU0FBUSxhQUFnQjtJQUl4RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsb0NBQW9DO1lBQ2pELFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxNQUFNLEVBQWM7UUFDNUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7YUFDL0IsVUFBVSxDQUFDLHFCQUFxQixDQUFDO2FBQ2pDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDekMsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQzNDLE9BQU8sRUFBRSxDQUFDO1FBRWYsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQ2pFLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsT0FBTzthQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUEsb0JBQWMsRUFBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzVELElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUM3RCxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQ2xDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUNWLE9BQU8sSUFBQSxrQkFBWSxFQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsTUFBTSxDQUFDLElBQUksUUFBUSxJQUFBLG9CQUFjLEVBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQzVHO2FBQ0EsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhCLE1BQU0sTUFBTSxHQUFHLENBQUMsTUFBTTtZQUNsQixDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLHlEQUF5RDtZQUNoRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRVQsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUEsa0JBQVcsRUFBQzs7O1VBR25DLE9BQU87O1VBRVAsTUFBTTtTQUNQLENBQUMsRUFBRTtZQUNBLFlBQVksRUFBRSxZQUFZO1NBQzdCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWhERCxpQ0FnREMifQ==