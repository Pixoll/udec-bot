"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const package_1 = __importDefault(require("../package"));
const util_1 = require("../util");
class SourceCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'source',
            description: 'Vínculo al código fuente.',
        });
    }
    async run(context) {
        await context.fancyReply((0, util_1.stripIndent)(`
        *UdeC Bot v${package_1.default.version}*

        Código fuente: [GitHub](${package_1.default.repository.url})
        `).replace(/[.-]/g, '\\$&'), {
            'link_preview_options': {
                'is_disabled': false,
            },
        });
    }
}
exports.default = SourceCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL3NvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLGdDQUFpRTtBQUNqRSx5REFBcUM7QUFDckMsa0NBQXNDO0FBRXRDLE1BQXFCLGFBQWMsU0FBUSxhQUFXO0lBSWxELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSwyQkFBMkI7U0FDM0MsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUI7UUFDcEMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUEsa0JBQVcsRUFBQztxQkFDeEIsaUJBQVcsQ0FBQyxPQUFPOztrQ0FFTixpQkFBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHO1NBQ25ELENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ3pCLHNCQUFzQixFQUFFO2dCQUNwQixhQUFhLEVBQUUsS0FBSzthQUN2QjtTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXRCRCxnQ0FzQkMifQ==