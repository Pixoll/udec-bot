"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const sourceUrl = 'https://github.com/Pixoll/udec-bot';
class SourceCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'source',
            description: 'Vínculo al código fuente.',
        });
    }
    async run(context) {
        await context.fancyReply(`[Código fuente](${sourceUrl})`);
    }
}
exports.default = SourceCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL3NvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdDQUFpRTtBQUVqRSxNQUFNLFNBQVMsR0FBRyxvQ0FBb0MsQ0FBQztBQUV2RCxNQUFxQixhQUFjLFNBQVEsYUFBVztJQUNsRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsMkJBQTJCO1NBQzNDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUM5RCxDQUFDO0NBQ0o7QUFYRCxnQ0FXQyJ9