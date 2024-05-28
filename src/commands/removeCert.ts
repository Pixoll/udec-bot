import { Markup } from "telegraf";
import { ReplyKeyboardMarkup } from "telegraf/typings/core/types/typegram";
import { TelegramClientType } from "../client";
import {
    Command,
    CommandContext,
    MessageContext,
    SessionString,
    TelegramClient,
    capitalize,
    dateAtSantiago,
    dateToString,
    parseContext,
} from "../lib";
import { daysUntilToString, getDaysUntil, removeKeyboard, stripIndent } from "../util";
import { ActionType, Assignment, AssignmentType, Subject } from "../tables";

type AssignmentWithSubjectName = Omit<Assignment, "chat_id"> & {
    subject_name: Subject["name"];
};

const assignmentTypes = Object.values(AssignmentType).map(v => capitalize(v));
const assignmentStringRegex = new RegExp(
    `^(?<type>${assignmentTypes.join("|")}) - `
    + /\[(?<subjectCode>\d+)\] [\w ]+ /.source
    + /\((?<dueDate>\d{2}\/\d{2}\/\d{4})\)/.source
);

const confirmationRegex = /^(👍|❌)$/;
const confirmationKeyboard = Markup
    .keyboard([["👍", "❌"]])
    .oneTime()
    .resize()
    .selective()
    .placeholder("/cancel para abortar.")
    .reply_markup;

interface AssignmentMatchGroups {
    readonly type: string;
    readonly subjectCode: string;
    readonly dueDate: string;
}

export default class RemoveCertCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;
    private readonly assignments: Map<SessionString, AssignmentWithSubjectName[]>;
    private readonly waitingConfirmation: Map<SessionString, AssignmentWithSubjectName>;

    public constructor(client: TelegramClient) {
        super(client, {
            name: "removecert",
            description: "Remover un ramo del grupo.",
            groupOnly: true,
            ensureInactiveMenus: true,
        });

        this.assignments = new Map();
        this.waitingConfirmation = new Map();

        client.hears(assignmentStringRegex, (...args) => this.assignmentListener(...args));
        client.hears(confirmationRegex, (...args) => this.confirmationListener(...args));
    }

    public async run(context: CommandContext): Promise<void> {
        const assignments = await this.client.db
            .selectFrom("udec_assignment as assignment")
            .innerJoin("udec_subject as subject", "assignment.subject_code", "subject.code")
            .select([
                "assignment.id",
                "assignment.type",
                "assignment.subject_code",
                "subject.name as subject_name",
                "assignment.date_due",
            ])
            .where("assignment.chat_id", "=", `${context.chat.id}`)
            .execute();

        if (assignments.length === 0) {
            await context.fancyReply(stripIndent(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }

        const assignmentsStrings = assignments
            .map(a => ({ ...a, date_due: dateAtSantiago(a.date_due) }))
            .sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map((s) => `${capitalize(s.type)} - [${s.subject_code}] ${s.subject_name} (${dateToString(s.date_due)})`);

        this.assignments.set(context.session, assignments);
        this.client.activeMenus.set(context.session, this.name);

        await context.fancyReply(stripIndent(`
        Elige una evaluación de la lista para eliminar.

        Usa /cancel para cancelar.
        `), {
            "reply_markup": createSelectionMenu(assignmentsStrings),
        });
    }

    private async confirmDeletion(context: CommandContext, assignments: AssignmentWithSubjectName[]): Promise<void> {
        const { dueDate, subjectCode, type } = context.text
            .match(assignmentStringRegex)?.groups as unknown as AssignmentMatchGroups;

        const assignment = assignments.find(a =>
            a.date_due === dueDate.replace(/^\d/g, "-")
            && a.subject_code === +subjectCode
            && a.type === type.toLowerCase()
        );

        if (!assignment) {
            this.client.activeMenus.delete(context.session);
            await context.fancyReply("No se pudo identificar la evaluación que quieres remover.", removeKeyboard);
            return;
        }

        this.waitingConfirmation.set(context.session, assignment);

        /* eslint-disable indent */
        await context.fancyReply(stripIndent(`
        *¿Estás seguro que quieres eliminar esta evaluación?*

        *Tipo*: ${capitalize(assignment.type)}
        *Ramo*: \\[${assignment.subject_code}\\] ${assignment.subject_name}
        *Fecha*: ${assignment.date_due.replace(/-/g, "/")} \\(${daysUntilToString(
            getDaysUntil(dateAtSantiago(assignment.date_due))
        )}\\)
        `), {
            "parse_mode": "MarkdownV2",
            "reply_markup": confirmationKeyboard,
        });
        /* eslint-enable indent */
    }

    private async deleteAssignment(context: CommandContext, assignment: AssignmentWithSubjectName): Promise<void> {
        if (context.text === "❌") {
            await context.fancyReply("La evaluación no será removida.", removeKeyboard);
            return;
        }

        try {
            await this.client.db
                .deleteFrom("udec_assignment")
                .where("id", "=", assignment.id)
                .executeTakeFirstOrThrow();
        } catch (error) {
            await context.fancyReply("Hubo un error al remover la evaluación.", removeKeyboard);
            await this.client.catchError(error, context);
            return;
        }

        await context.fancyReply("🗑 *La evaluación ha sido eliminada\\.*", {
            "parse_mode": "MarkdownV2",
            ...removeKeyboard,
        });

        try {
            await this.client.db
                .insertInto("udec_action_history")
                .values({
                    chat_id: `${context.chat.id}`,
                    timestamp: dateAtSantiago().toISOString().replace(/T|\.\d{3}Z$/g, ""),
                    type: ActionType.RemoveAssignment,
                    username: context.from.full_username,
                })
                .executeTakeFirstOrThrow();
        } catch (error) {
            await this.client.catchError(error, context);
        }
    }

    private async assignmentListener(ctx: MessageContext, next: () => Promise<void>): Promise<void> {
        const context = parseContext(ctx, this.client as unknown as TelegramClient);
        const activeMenu = this.client.activeMenus.get(context.session);
        if (activeMenu !== this.name || this.waitingConfirmation.has(context.session)) {
            next();
            return;
        }

        const assignments = this.assignments.get(context.session);
        if (!assignments) {
            next();
            return;
        }

        this.assignments.delete(context.session);
        await this.confirmDeletion(context, assignments);
    }

    private async confirmationListener(ctx: MessageContext, next: () => Promise<void>): Promise<void> {
        const context = parseContext(ctx, this.client as unknown as TelegramClient);
        const activeMenu = this.client.activeMenus.get(context.session);
        if (activeMenu !== this.name || this.assignments.has(context.session)) {
            next();
            return;
        }

        const assignment = this.waitingConfirmation.get(context.session);
        if (!assignment) {
            next();
            return;
        }

        this.client.activeMenus.delete(context.session);
        this.waitingConfirmation.delete(context.session);
        await this.deleteAssignment(context, assignment);
    }
}

function createSelectionMenu(assignments: string[]): ReplyKeyboardMarkup {
    return Markup
        .keyboard(assignments, {
            columns: 1,
        })
        .oneTime()
        .resize()
        .selective()
        .placeholder("/cancel para abortar.")
        .reply_markup;
}
