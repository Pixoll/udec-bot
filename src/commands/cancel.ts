import { TelegramClientType } from "../client";
import { Command, CommandContext, TelegramClient } from "../lib";

// noinspection JSUnusedGlobalSymbols
export default class CancelCommand extends Command {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: "cancel",
            description: "Cancela un menú.",
            groupOnly: true,
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const { activeMenus } = this.client;
        const { session } = context;
        const menu = activeMenus.get(session);
        if (!menu) {
            await context.fancyReply("No tienes ningún menú activo.");
            return;
        }

        activeMenus.delete(session);
        await context.fancyReply(`El menú de /${menu} ha sido cancelado.`, {
            "reply_markup": {
                "remove_keyboard": true,
            },
        });
    }
}
