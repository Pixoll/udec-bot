import { Markup } from "telegraf";
import { ReplyKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { TelegramClientType } from "../client";
import {
    Command,
    CommandContext,
    MessageContext,
    QueryErrorNumber,
    SessionString,
    TelegramClient,
    parseContext,
} from "../lib";
import { alphabetically, removeKeyboard, stripIndent } from "../util";
import { ActionType, SubjectObject } from "../tables";

const confirmationRegex = /^(👍|❌)$/;
const confirmationKeyboard = Markup
    .keyboard([["👍", "❌"]])
    .oneTime()
    .resize()
    .selective()
    .placeholder("/cancel para abortar.")
    .reply_markup;

export default class RemoveRamoCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;
    private readonly subjects: Map<SessionString, SubjectObject[]>;
    private readonly waitingConfirmation: Map<SessionString, SubjectObject>;

    public constructor(client: TelegramClient) {
        super(client, {
            name: "removeramo",
            description: "Remover un ramo del grupo.",
            groupOnly: true,
            ensureInactiveMenus: true,
        });

        this.subjects = new Map();
        this.waitingConfirmation = new Map();

        client.hears(/^\[\d+\] .+ \(\d+ créditos\)$/, (...args) => this.subjectListener(...args));
        client.hears(confirmationRegex, (...args) => this.confirmationListener(...args));
    }

    public async run(context: CommandContext): Promise<void> {
        const subjects = await this.client.db.select("udec_subjects", builder => builder.where({
            column: "chat_id",
            equals: context.chat.id,
        }));
        if (!subjects.ok || (subjects.ok && subjects.result.length === 0)) {
            await context.fancyReply(stripIndent(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }

        const subjectStrings = subjects.result.sort(alphabetically("name"))
            .map(s => `[${s.code}] ${s.name} (${s.credits} créditos)`);
        const selectionMenu = createSelectionMenu(subjectStrings);

        this.subjects.set(context.session, subjects.result);
        this.client.activeMenus.set(context.session, this.name);

        await context.fancyReply(stripIndent(`
        Elige el ramo a eliminar desde el menú.

        Usa /cancel para cancelar.
        `), {
            "reply_markup": selectionMenu,
        });
    }

    private async confirmDeletion(context: CommandContext, subjects: SubjectObject[]): Promise<void> {
        const code = +(context.text.match(/^\[(\d+)\]/)?.[1] ?? -1);
        const subject = subjects.find(s => s.code === code);
        if (!subject) {
            await context.fancyReply("No se pudo identificar el ramo que quieres remover.", removeKeyboard);
            return;
        }

        this.waitingConfirmation.set(context.session, subject);

        await context.fancyReply(stripIndent(`
        *¿Estás seguro que quieres eliminar este ramo?*

        *Nombre*: ${subject.name}
        *Código*: ${subject.code}
        *Créditos*: ${subject.credits}
        `), {
            "parse_mode": "MarkdownV2",
            "reply_markup": confirmationKeyboard,
        });
    }

    private async deleteSubject(context: CommandContext, subject: SubjectObject): Promise<void> {
        if (context.text === "❌") {
            await context.fancyReply("El ramo no será removido.", removeKeyboard);
            return;
        }

        const deleted = await this.client.db.delete("udec_subjects", builder => builder
            .where({
                column: "chat_id",
                equals: context.chat.id,
            })
            .where({
                column: "code",
                equals: subject.code,
            })
        );
        if (!deleted.ok) {
            if (deleted.error.errno === QueryErrorNumber.CannotDeleteParent) {
                await context.fancyReply(stripIndent(`
                *No se puede eliminar este ramo\\.*

                Aún existen evaluaciones vigentes vinculadas a este ramo\\. Elimina esas primero con /removecert\\.
                `), {
                    "parse_mode": "MarkdownV2",
                    ...removeKeyboard,
                });
                return;
            }

            await context.fancyReply("Hubo un error al remover el ramo.", removeKeyboard);
            await this.client.catchError(deleted.error, context);
            return;
        }

        await context.fancyReply("🗑 *El ramo ha sido eliminado\\.*", {
            "parse_mode": "MarkdownV2",
            ...removeKeyboard,
        });

        await this.client.db.insert("udec_actions_history", builder => builder.values({
            "chat_id": context.chat.id,
            username: context.from.full_username,
            type: ActionType.RemoveSubject,
            timestamp: new Date(),
        }));
    }

    private async subjectListener(ctx: MessageContext, next: () => Promise<void>): Promise<void> {
        const context = parseContext(ctx, this.client as unknown as TelegramClient);
        const activeMenu = this.client.activeMenus.get(context.session);
        if (activeMenu !== this.name || this.waitingConfirmation.has(context.session)) {
            next();
            return;
        }

        const subjects = this.subjects.get(context.session);
        if (!subjects) {
            next();
            return;
        }

        this.subjects.delete(context.session);
        await this.confirmDeletion(context, subjects);
    }

    private async confirmationListener(ctx: MessageContext, next: () => Promise<void>): Promise<void> {
        const context = parseContext(ctx, this.client as unknown as TelegramClient);
        const activeMenu = this.client.activeMenus.get(context.session);
        if (activeMenu !== this.name || this.subjects.has(context.session)) {
            next();
            return;
        }

        const subject = this.waitingConfirmation.get(context.session);
        if (!subject) {
            next();
            return;
        }

        this.client.activeMenus.delete(context.session);
        this.waitingConfirmation.delete(context.session);
        await this.deleteSubject(context, subject);
    }
}

function createSelectionMenu(subjects: string[]): ReplyKeyboardMarkup {
    return Markup
        .keyboard(subjects, {
            columns: 1,
        })
        .oneTime()
        .resize()
        .selective()
        .placeholder("/cancel para abortar.")
        .reply_markup;
}
