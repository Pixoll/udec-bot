import { TelegramClientType } from "../client";
import {
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
    Command,
    CommandContext,
    dateToString,
    escapeMarkdown,
    TelegramClient,
} from "../lib";
import { stripIndent } from "../util";

const args = [{
    key: "amount",
    label: "cantidad",
    prompt: "Ingrese la cantidad de acciones a mostrar.",
    type: ArgumentType.Number,
    min: 1,
}] as const satisfies ArgumentOptions[];

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

// noinspection JSUnusedGlobalSymbols
export default class HistoryCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: "history",
            description: "Historial de acciones en el grupo.",
            groupOnly: true,
            args,
        });
    }

    public async run(context: CommandContext, { amount }: ArgsResult): Promise<void> {
        const actions = await this.client.db
            .selectFrom("udec_action_history")
            .select(["timestamp", "type", "username"])
            .where("chat_id", "=", `${context.chat.id}`)
            .execute();

        if (actions.length === 0) {
            await context.fancyReply("El historial de acciones está vacío.");
            return;
        }

        const history = actions
            .map(a => ({
                ...a,
                timestamp: new Date(a.timestamp),
            }))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, amount ?? actions.length)
            .map(record =>
                `• \`${dateToString(record.timestamp, true)}\` \\- ${record.type} \\- ${escapeMarkdown(record.username)}`
            )
            .join("\n");

        const footer = !amount
            ? `Usa \`/${this.name} <${args[0].label}>\` para mostrar una cantidad específica de acciones\\.`
            : "";

        await context.fancyReply(stripIndent(`
        👁️ *Historial de acciones:*

        ${history}

        ${footer}
        `), {
            parse_mode: "MarkdownV2",
        });
    }
}
