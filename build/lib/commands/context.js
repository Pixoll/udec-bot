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
    Object.defineProperty(context.from, 'full_username', {
        get() {
            return this.username
                ?? [this.first_name, this.last_name].filter(n => n).join(', ');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29tbWFuZHMvY29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUM7QUF1Qm5DLFNBQWdCLFlBQVksQ0FBQyxHQUFtQixFQUFFLE1BQXNCO0lBQ3BFLE1BQU0sT0FBTyxHQUFHLEdBQXFCLENBQUM7SUFFdEMsTUFBTSxDQUFDLE1BQU0sQ0FBMEMsT0FBTyxFQUFFO1FBQzVELE1BQU07UUFDTixPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtLQUMzQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1FBQ2pELEdBQUc7WUFDQyxPQUFPLElBQUksQ0FBQyxRQUFRO21CQUNiLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7S0FDSixDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUMsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQWpCRCxvQ0FpQkM7QUFFRCxLQUFLLFVBQVUsVUFBVSxDQUNDLElBQVksRUFBRSxRQUEyQixFQUFFO0lBRWpFLE9BQU8sTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUMxQixrQkFBa0IsRUFBRTtZQUNoQixZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVO1lBQ3RDLDZCQUE2QixFQUFFLElBQUk7U0FDdEM7UUFDRCxHQUFHLEtBQUs7S0FDWCxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDIn0=