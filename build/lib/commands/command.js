"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const util_1 = require("../util");
const argument_1 = require("./argument");
class Command {
    client;
    constructor(client, options) {
        this.client = client;
        Object.assign(this, (0, util_1.omit)(options, ['args']));
        this.groupOnly ??= false;
        this.args = (options.args?.map(arg => new argument_1.Argument(client, arg)) ?? []);
    }
    canRunHere(context) {
        return this.groupOnly && context.chat.type !== 'private';
    }
    async parseArgs(context) {
        if (!this.args) {
            return {
                ok: true,
                values: {},
            };
        }
        const { text } = context.message;
        const args = {};
        const argsStrings = text.replace(/\/\w+ ?/, '').split(/ +/g);
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            const value = i === this.args.length - 1 ? argsStrings.slice(i).join(' ') : argsStrings[i];
            // eslint-disable-next-line no-await-in-loop
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29tbWFuZHMvY29tbWFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxrQ0FBK0I7QUFDL0IseUNBQTRFO0FBMkM1RSxNQUFzQixPQUFPO0lBQ1QsTUFBTSxDQUFpQjtJQU12QyxZQUFzQixNQUFzQixFQUFFLE9BQTZCO1FBQ3ZFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLG1CQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFtQyxDQUFDO0lBQzlHLENBQUM7SUFJTSxVQUFVLENBQUMsT0FBdUI7UUFDckMsT0FBTyxJQUFJLENBQUMsU0FBUyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQztJQUM3RCxDQUFDO0lBRU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUF1QjtRQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2IsT0FBTztnQkFDSCxFQUFFLEVBQUUsSUFBSTtnQkFDUixNQUFNLEVBQUUsRUFBRTthQUNiLENBQUM7UUFDTixDQUFDO1FBRUQsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDakMsTUFBTSxJQUFJLEdBQWlCLEVBQUUsQ0FBQztRQUM5QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDeEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQTJCLENBQUM7WUFDbkQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRiw0Q0FBNEM7WUFDNUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoRCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxNQUFNLENBQUM7WUFFOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxPQUFPO1lBQ0gsRUFBRSxFQUFFLElBQUk7WUFDUixNQUFNLEVBQUUsSUFBSTtTQUNmLENBQUM7SUFDTixDQUFDO0NBQ0o7QUEvQ0QsMEJBK0NDIn0=