"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
class CancelCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: "cancel",
            description: "Cancela un menú.",
            groupOnly: true,
        });
    }
    async run(context) {
        const { activeMenus } = this.client;
        const { session } = context;
        const menu = activeMenus.get(session);
        if (!menu) {
            await context.fancyReply("No tienes ningún menú activo.");
            return;
        }
        activeMenus.delete(session);
        await context.fancyReply(`El menú de /${menu} ha sido cancelado.`, {
            "reply_markup": {
                "remove_keyboard": true,
            },
        });
    }
}
exports.default = CancelCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuY2VsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL2NhbmNlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGdDQUFpRTtBQUVqRSxNQUFxQixhQUFjLFNBQVEsYUFBVztJQUlsRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsa0JBQWtCO1lBQy9CLFNBQVMsRUFBRSxJQUFJO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDNUIsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDUixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUMxRCxPQUFPO1FBQ1gsQ0FBQztRQUVELFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUIsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLGVBQWUsSUFBSSxxQkFBcUIsRUFBRTtZQUMvRCxjQUFjLEVBQUU7Z0JBQ1osaUJBQWlCLEVBQUUsSUFBSTthQUMxQjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTVCRCxnQ0E0QkMifQ==