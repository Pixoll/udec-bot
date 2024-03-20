import { Context } from 'telegraf';
import { CommandContextExtn, ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { TelegramClient } from '../client';

export declare class MessageContext extends Context<Update.MessageUpdate<Message.TextMessage>> {
}

export type SessionString = `${number}:${number}`;

export declare class CommandContext extends MessageContext implements CommandContextExtn {
    public readonly match: RegExpExecArray;
    public readonly command: string;
    public readonly payload: string;
    public readonly args: string[];
    public readonly client: TelegramClient;
    public readonly session: SessionString;
    public get from(): MessageContext['from'] & {
        get full_username(): string;
    };
    public fancyReply(text: string, extra?: ExtraReplyMessage | undefined): Promise<Message.TextMessage | null>;
}

export function parseContext(ctx: MessageContext, client: TelegramClient): CommandContext {
    const context = ctx as CommandContext;

    Object.assign<CommandContext, Partial<CommandContext>>(context, {
        client,
        session: `${ctx.chat.id}:${ctx.from.id}`,
    });

    if (!('full_username' in context.from)) {
        Object.defineProperty(context.from, 'full_username', {
            get(this: MessageContext['from']): string {
                return this.username
                    ?? [this.first_name, this.last_name].filter(n => n).join(', ');
            },
        });
    }

    context.fancyReply = fancyReply.bind(context);
    return context;
}

async function fancyReply(
    this: CommandContext, text: string, extra: ExtraReplyMessage = {}
): Promise<Message.TextMessage | null> {
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
