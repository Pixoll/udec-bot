"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const lib_1 = require("../lib");
const util_1 = require("../util");
const packageJson = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, "../../package.json"), "utf-8"));
const sourceMessage = (0, util_1.stripIndent)(`
*UdeC Bot v${(0, lib_1.escapeMarkdown)(packageJson.version)}*

Código fuente: [GitHub](${(0, lib_1.escapeMarkdown)(packageJson.repository.url)})
`);
class SourceCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: "source",
            description: "Vínculo al código fuente.",
        });
    }
    async run(context) {
        await context.fancyReply(sourceMessage, {
            "parse_mode": "MarkdownV2",
        });
    }
}
exports.default = SourceCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL3NvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJCQUFrQztBQUNsQyxnREFBd0I7QUFFeEIsZ0NBQWlGO0FBQ2pGLGtDQUFzQztBQUV0QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUEsaUJBQVksRUFBQyxjQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFnQixDQUFDO0FBYWpILE1BQU0sYUFBYSxHQUFHLElBQUEsa0JBQVcsRUFBQzthQUNyQixJQUFBLG9CQUFjLEVBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQzs7MEJBRXRCLElBQUEsb0JBQWMsRUFBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztDQUNuRSxDQUFDLENBQUM7QUFHSCxNQUFxQixhQUFjLFNBQVEsYUFBTztJQUk5QyxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsMkJBQTJCO1NBQzNDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUU7WUFDcEMsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBaEJELGdDQWdCQyJ9