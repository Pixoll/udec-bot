import { Context } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { Command } from './command';

export declare class MessageContext extends Context<Update.MessageUpdate<Message.TextMessage>> {
}

export declare class CommandContext extends MessageContext {
    public readonly command: Command;
    public readonly session: string;
    public fancyReply(text: string, extra?: ExtraReplyMessage | undefined): Promise<Message.TextMessage | null>;
}

export function parseContext(ctx: MessageContext, command: Command): CommandContext {
    const context = ctx as CommandContext;
    Object.assign<CommandContext, Partial<CommandContext>>(context, {
        command,
        session: `${ctx.from.id}:${ctx.chat.id}`,
    });
    context.fancyReply = fancyReply.bind(context);
    return context;
}

async function fancyReply(
    this: CommandContext, text: string, extra: ExtraReplyMessage = {}
): Promise<Message.TextMessage | null> {
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
