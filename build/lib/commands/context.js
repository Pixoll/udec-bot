"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseContext = void 0;
const telegraf_1 = require("telegraf");
function parseContext(ctx, command) {
    const context = ctx;
    Object.assign(context, {
        command,
        session: `${ctx.from.id}:${ctx.chat.id}`,
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
        this.command.client.catchError(error, this);
        return null;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29tbWFuZHMvY29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUM7QUFjbkMsU0FBZ0IsWUFBWSxDQUFDLEdBQW1CLEVBQUUsT0FBZ0I7SUFDOUQsTUFBTSxPQUFPLEdBQUcsR0FBcUIsQ0FBQztJQUN0QyxNQUFNLENBQUMsTUFBTSxDQUEwQyxPQUFPLEVBQUU7UUFDNUQsT0FBTztRQUNQLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO0tBQzNDLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QyxPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBUkQsb0NBUUM7QUFFRCxLQUFLLFVBQVUsVUFBVSxDQUNDLElBQVksRUFBRSxRQUEyQixFQUFFO0lBRWpFLE9BQU8sTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUMxQixrQkFBa0IsRUFBRTtZQUNoQixZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVO1lBQ3RDLDZCQUE2QixFQUFFLElBQUk7U0FDdEM7UUFDRCxHQUFHLEtBQUs7S0FDWCxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7UUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyJ9