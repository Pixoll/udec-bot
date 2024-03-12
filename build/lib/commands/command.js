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
        this.args = (options.args?.map(arg => new argument_1.Argument(client, arg)) ?? []);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29tbWFuZHMvY29tbWFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxrQ0FBK0I7QUFDL0IseUNBQTRFO0FBMEM1RSxNQUFzQixPQUFPO0lBQ1QsTUFBTSxDQUFpQjtJQUt2QyxZQUFzQixNQUFzQixFQUFFLE9BQTZCO1FBQ3ZFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLG1CQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFtQyxDQUFDO0lBQzlHLENBQUM7SUFJTSxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQXVCO1FBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDYixPQUFPO2dCQUNILEVBQUUsRUFBRSxJQUFJO2dCQUNSLE1BQU0sRUFBRSxFQUFFO2FBQ2IsQ0FBQztRQUNOLENBQUM7UUFFRCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUNqQyxNQUFNLElBQUksR0FBaUIsRUFBRSxDQUFDO1FBQzlCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBMkIsQ0FBQztZQUNuRCxNQUFNLEtBQUssR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNGLDRDQUE0QztZQUM1QyxNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFBRSxPQUFPLE1BQU0sQ0FBQztZQUU5QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakMsQ0FBQztRQUVELE9BQU87WUFDSCxFQUFFLEVBQUUsSUFBSTtZQUNSLE1BQU0sRUFBRSxJQUFJO1NBQ2YsQ0FBQztJQUNOLENBQUM7Q0FDSjtBQXpDRCwwQkF5Q0MifQ==