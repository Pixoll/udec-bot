"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const util_1 = require("../util");
const argument_1 = require("./argument");
class Command {
    client;
    constructor(client, options) {
        this.client = client;
        Object.assign(this, (0, util_1.omit)(options, ["args"]));
        this.groupOnly ??= false;
        this.ensureInactiveMenus ??= false;
        this.args = (options.args?.map(arg => new argument_1.Argument(client, arg)) ?? []);
    }
    canRunHere(context) {
        if (this.groupOnly && context.chat.type === "private") {
            return "Este comando solo puede ser usado en chats grupales.";
        }
        return true;
    }
    async parseArgs(context) {
        if (!this.args) {
            return {
                ok: true,
                values: {},
            };
        }
        const args = {};
        const argsStrings = context.args;
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            const value = i === this.args.length - 1 ? argsStrings.slice(i).join(" ") : argsStrings[i];
            const result = await arg.obtain(value, context);
            if (!result.ok)
                return result;
            args[arg.key] = result.value;
        }
        return {
            ok: true,
            values: args,
        };
    }
}
exports.Command = Command;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29tbWFuZHMvY29tbWFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxrQ0FBK0I7QUFDL0IseUNBQTRFO0FBOEM1RSxNQUFzQixPQUFPO0lBQ1QsTUFBTSxDQUFpQjtJQU92QyxZQUFzQixNQUFzQixFQUFFLE9BQTZCO1FBQ3ZFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsbUJBQW1CLEtBQUssS0FBSyxDQUFDO1FBQ25DLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksbUJBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQW1DLENBQUM7SUFDOUcsQ0FBQztJQUlNLFVBQVUsQ0FBQyxPQUF1QjtRQUNyQyxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDcEQsT0FBTyxzREFBc0QsQ0FBQztRQUNsRSxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBdUI7UUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNiLE9BQU87Z0JBQ0gsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsTUFBTSxFQUFFLEVBQUU7YUFDYixDQUFDO1FBQ04sQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFpQixFQUFFLENBQUM7UUFDOUIsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBYSxDQUFDO1lBQ3JDLE1BQU0sS0FBSyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxNQUFNLENBQUM7WUFFOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxPQUFPO1lBQ0gsRUFBRSxFQUFFLElBQUk7WUFDUixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFuREQsMEJBbURDIn0=