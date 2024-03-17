"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseContext = void 0;
const telegraf_1 = require("telegraf");
function parseContext(ctx, client) {
    const context = ctx;
    Object.assign(context, {
        client,
        session: `${ctx.chat.id}:${ctx.from.id}`,
    });
    Object.assign(context.from, {
        // eslint-disable-next-line camelcase
        get full_username() {
            if (this.username)
                return `@${this.username}`;
            return [this.first_name, this.last_name].filter(n => n).join(', ');
        },
    });
    context.fancyReply = fancyReply.bind(context);
    return context;
}
exports.parseContext = parseContext;
async function fancyReply(text, extra = {}) {
    return await this.reply(text, {
        'reply_parameters': {
            'message_id': this.message?.message_id,
            'allow_sending_without_reply': true,
        },
        ...extra,
    }).catch((error) => {
        this.client.catchError(error, this);
        return null;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29tbWFuZHMvY29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUM7QUF1Qm5DLFNBQWdCLFlBQVksQ0FBQyxHQUFtQixFQUFFLE1BQXNCO0lBQ3BFLE1BQU0sT0FBTyxHQUFHLEdBQXFCLENBQUM7SUFDdEMsTUFBTSxDQUFDLE1BQU0sQ0FBMEMsT0FBTyxFQUFFO1FBQzVELE1BQU07UUFDTixPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtLQUMzQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsTUFBTSxDQUEwRCxPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ2pGLHFDQUFxQztRQUNyQyxJQUFJLGFBQWE7WUFDYixJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RSxDQUFDO0tBQ0osQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUM7QUFmRCxvQ0FlQztBQUVELEtBQUssVUFBVSxVQUFVLENBQ0MsSUFBWSxFQUFFLFFBQTJCLEVBQUU7SUFFakUsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQzFCLGtCQUFrQixFQUFFO1lBQ2hCLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVU7WUFDdEMsNkJBQTZCLEVBQUUsSUFBSTtTQUN0QztRQUNELEdBQUcsS0FBSztLQUNYLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMifQ==