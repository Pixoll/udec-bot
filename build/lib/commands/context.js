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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29tbWFuZHMvY29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUM7QUF1Qm5DLFNBQWdCLFlBQVksQ0FBQyxHQUFtQixFQUFFLE1BQXNCO0lBQ3BFLE1BQU0sT0FBTyxHQUFHLEdBQXFCLENBQUM7SUFFdEMsTUFBTSxDQUFDLE1BQU0sQ0FBMEMsT0FBTyxFQUFFO1FBQzVELE1BQU07UUFDTixPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtLQUMzQyxDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1FBQ2pELEdBQUc7WUFDQyxJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RSxDQUFDO0tBQ0osQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUM7QUFqQkQsb0NBaUJDO0FBRUQsS0FBSyxVQUFVLFVBQVUsQ0FDQyxJQUFZLEVBQUUsUUFBMkIsRUFBRTtJQUVqRSxPQUFPLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDMUIsa0JBQWtCLEVBQUU7WUFDaEIsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVTtZQUN0Qyw2QkFBNkIsRUFBRSxJQUFJO1NBQ3RDO1FBQ0QsR0FBRyxLQUFLO0tBQ1gsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyJ9