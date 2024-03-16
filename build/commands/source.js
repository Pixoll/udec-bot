"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const lib_1 = require("../lib");
const util_1 = require("../util");
const packageJson = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../package.json'), 'utf-8'));
class SourceCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'source',
            description: 'Vínculo al código fuente.',
        });
    }
    async run(context) {
        await context.fancyReply((0, util_1.stripIndent)(`
        *UdeC Bot v${packageJson.version}*

        Código fuente: [GitHub](${packageJson.repository.url})
        `).replace(/[.-]/g, '\\$&'), {
            'parse_mode': 'MarkdownV2',
            'link_preview_options': {
                'is_disabled': false,
            },
        });
    }
}
exports.default = SourceCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL3NvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJCQUFrQztBQUNsQyxnREFBd0I7QUFFeEIsZ0NBQWlFO0FBQ2pFLGtDQUFzQztBQUV0QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUEsaUJBQVksRUFBQyxjQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFnQixDQUFDO0FBYWpILE1BQXFCLGFBQWMsU0FBUSxhQUFXO0lBSWxELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSwyQkFBMkI7U0FDM0MsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUI7UUFDcEMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUEsa0JBQVcsRUFBQztxQkFDeEIsV0FBVyxDQUFDLE9BQU87O2tDQUVOLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRztTQUNuRCxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTtZQUN6QixZQUFZLEVBQUUsWUFBWTtZQUMxQixzQkFBc0IsRUFBRTtnQkFDcEIsYUFBYSxFQUFFLEtBQUs7YUFDdkI7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF2QkQsZ0NBdUJDIn0=