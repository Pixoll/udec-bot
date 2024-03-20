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
    if (!('full_username' in context.from)) {
        Object.defineProperty(context.from, 'full_username', {
            get() {
                return this.username
                    ?? [this.first_name, this.last_name].filter(n => n).join(', ');
            },
        });
    }
    context.fancyReply = fancyReply.bind(context);
    return context;
}
exports.parseContext = parseContext;
async function fancyReply(text, extra = {}) {
    return await this.reply(text, {
        'reply_parameters': {
            'message_id': this.msgId,
            'allow_sending_without_reply': true,
        },
        ...extra,
    }).catch((error) => {
        this.client.catchError(error, this);
        return null;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29tbWFuZHMvY29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUM7QUF1Qm5DLFNBQWdCLFlBQVksQ0FBQyxHQUFtQixFQUFFLE1BQXNCO0lBQ3BFLE1BQU0sT0FBTyxHQUFHLEdBQXFCLENBQUM7SUFFdEMsTUFBTSxDQUFDLE1BQU0sQ0FBMEMsT0FBTyxFQUFFO1FBQzVELE1BQU07UUFDTixPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtLQUMzQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDckMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNqRCxHQUFHO2dCQUNDLE9BQU8sSUFBSSxDQUFDLFFBQVE7dUJBQ2IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkUsQ0FBQztTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUMsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQW5CRCxvQ0FtQkM7QUFFRCxLQUFLLFVBQVUsVUFBVSxDQUNDLElBQVksRUFBRSxRQUEyQixFQUFFO0lBRWpFLE9BQU8sTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUMxQixrQkFBa0IsRUFBRTtZQUNoQixZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDeEIsNkJBQTZCLEVBQUUsSUFBSTtTQUN0QztRQUNELEdBQUcsS0FBSztLQUNYLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtRQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMifQ==