import { Markup } from "telegraf";
import { ReplyKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { TelegramClientType } from "../client";
import {
    Command,
    CommandContext,
    MessageContext,
    SessionString,
    TelegramClient,
    dateAtSantiago,
    parseContext,
} from "../lib";
import { alphabetically, dateToSqlTimestamp, removeKeyboard, stripIndent } from "../util";
import { ActionType, Subject } from "../tables";

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
    private readonly subjects: Map<SessionString, Subject[]>;
    private readonly waitingConfirmation: Map<SessionString, Subject>;

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
        const subjects = await this.client.db
            .selectFrom("udec_chat_subject as chat_subject")
            .innerJoin("udec_subject as subject", "chat_subject.subject_code", "subject.code")
            .select(["subject.code", "subject.name", "subject.credits"])
            .where("chat_subject.chat_id", "=", `${context.chat.id}`)
            .execute();

        if (subjects.length === 0) {
            await context.fancyReply(stripIndent(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }

        const subjectStrings = subjects.sort(alphabetically("name"))
            .map(s => `[${s.code}] ${s.name} (${s.credits} créditos)`);
        const selectionMenu = createSelectionMenu(subjectStrings);

        this.subjects.set(context.session, subjects);
        this.client.activeMenus.set(context.session, this.name);

        await context.fancyReply(stripIndent(`
        Elige el ramo a eliminar desde el menú.

        Usa /cancel para cancelar.
        `), {
            "reply_markup": selectionMenu,
        });
    }

    private async confirmDeletion(context: CommandContext, subjects: Subject[]): Promise<void> {
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

    private async deleteSubject(context: CommandContext, subject: Subject): Promise<void> {
        if (context.text === "❌") {
            await context.fancyReply("El ramo no será removido.", removeKeyboard);
            return;
        }

        const registeredAssignments = await this.client.db
            .selectFrom("udec_assignment")
            .selectAll()
            .where("chat_id", "=", `${context.chat.id}`)
            .where("subject_code", "=", subject.code)
            .execute();

        if (registeredAssignments.length > 0) {
            await context.fancyReply(stripIndent(`
            *No se puede eliminar este ramo\\.*

            Aún existen evaluaciones vigentes vinculadas a este ramo\\. Elimina esas primero con /removecert\\.
            `), {
                "parse_mode": "MarkdownV2",
                ...removeKeyboard,
            });
            return;
        }

        try {
            await this.client.db
                .deleteFrom("udec_chat_subject")
                .where("chat_id", "=", `${context.chat.id}`)
                .where("subject_code", "=", subject.code)
                .executeTakeFirstOrThrow();
        } catch (error) {
            await context.fancyReply("Hubo un error al remover el ramo.", removeKeyboard);
            await this.client.catchError(error, context);
            return;
        }

        await context.fancyReply("🗑 *El ramo ha sido eliminado\\.*", {
            "parse_mode": "MarkdownV2",
            ...removeKeyboard,
        });

        try {
            await this.client.db
                .insertInto("udec_action_history")
                .values({
                    chat_id: `${context.chat.id}`,
                    timestamp: dateToSqlTimestamp(dateAtSantiago()),
                    type: ActionType.RemoveSubject,
                    username: context.from.full_username,
                })
                .executeTakeFirstOrThrow();
        } catch (error) {
            await this.client.catchError(error, context);
        }
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
