import { Markup } from "telegraf";
import { TelegramClientType } from "../client";
import {
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
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
import { ActionType, Assignment, AssignmentType, NewAssignment, Subject } from "../tables";
import { dateStringToSqlDate, dateToSqlTimestamp, removeKeyboard, stripIndent } from "../util";

const assignmentTypes = Object.values(AssignmentType).map(t => capitalize(t));
const assignmentTypeRegex = new RegExp(`^(?:${assignmentTypes.join("|")})$`);

const assignmentTypesKeyboard = Markup
    .keyboard(assignmentTypes)
    .oneTime()
    .resize()
    .selective()
    .placeholder("/cancel para abortar.")
    .reply_markup;

const args = [{
    key: "date",
    label: "fecha",
    prompt: "Ingrese la fecha de la evaluación.",
    type: ArgumentType.Date,
    required: true,
    futureDate: true,
    examples: ["/addcert DD-MM", "/addcert 03-05"],
} as const satisfies ArgumentOptions<ArgumentType.Date>] as const;

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

export default class AddCertCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;
    private readonly assignments: Map<SessionString, NewAssignment>;
    private readonly subjects: Map<SessionString, Subject[]>;

    public constructor(client: TelegramClient) {
        super(client, {
            name: "addcert",
            description: "Añade una evaluación al grupo.",
            groupOnly: true,
            ensureInactiveMenus: true,
            args,
        });

        this.assignments = new Map();
        this.subjects = new Map();

        client.hears(/^\[\d+\] .+ \(\d+ créditos\)$/, (...args) => this.subjectListener(...args));
        client.hears(assignmentTypeRegex, (...args) => this.assignmentTypeListener(...args));
    }

    public async run(context: CommandContext, { date }: ArgsResult): Promise<void> {
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

        this.subjects.set(context.session, subjects);
        this.client.activeMenus.set(context.session, this.name);

        const subjectsKeyboard = Markup
            .keyboard(subjects.map(s => `[${s.code}] ${s.name} (${s.credits} créditos)`))
            .oneTime()
            .resize()
            .selective()
            .placeholder("/cancel para abortar.")
            .reply_markup;

        this.assignments.set(context.session, {
            chat_id: `${context.chat.id}`,
            date_due: dateStringToSqlDate(dateToString(date)),
        } satisfies Partial<NewAssignment> as NewAssignment);

        await context.fancyReply(stripIndent(`
        _Fecha de evaluación registrada: ${dateToString(date)}_
        \n*Selecciona la asignatura a evaluar: ⬇️*
        `), {
            "parse_mode": "MarkdownV2",
            "reply_markup": subjectsKeyboard,
        });
    }

    private async setSubject(
        context: CommandContext, subjects: Subject[], assignment: Assignment
    ): Promise<void> {
        const code = +(context.text.match(/^\[(\d+)\]/)?.[1] ?? -1);
        const subject = subjects.find(s => s.code === code);
        if (!subject) {
            this.client.activeMenus.delete(context.session);
            this.assignments.delete(context.session);
            await context.fancyReply("No se pudo identificar la asignatura de la evaluación.", removeKeyboard);
            return;
        }

        assignment["subject_code"] = code;

        await context.fancyReply("*Elige el tipo de evaluación: ⬇️*", {
            "parse_mode": "MarkdownV2",
            "reply_markup": assignmentTypesKeyboard,
        });
    }

    private async addAssignment(context: CommandContext, assignment: Assignment): Promise<void> {
        assignment.type = context.text.toLowerCase() as AssignmentType;

        const registeredAssignment = await this.client.db
            .selectFrom("udec_assignment")
            .selectAll()
            .where("chat_id", "=", assignment.chat_id)
            .where("date_due", "=", assignment.date_due)
            .where("subject_code", "=", assignment.subject_code)
            .where("type", "=", assignment.type)
            .executeTakeFirst();

        if (registeredAssignment) {
            await context.fancyReply("*La evaluación que intentas agregar ya está registrada\\.*", {
                "parse_mode": "MarkdownV2",
                ...removeKeyboard,
            });
            return;
        }

        try {
            await this.client.db
                .insertInto("udec_assignment")
                .values(assignment)
                .executeTakeFirstOrThrow();
        } catch (error) {
            await context.fancyReply("Hubo un error al añadir la evaluación.", removeKeyboard);
            await this.client.catchError(error, context);
            return;
        }

        await context.fancyReply("*🎉 ¡La fecha de evaluación ha sido agregada\\!*", {
            "parse_mode": "MarkdownV2",
            ...removeKeyboard,
        });

        try {
            await this.client.db
                .insertInto("udec_action_history")
                .values({
                    chat_id: `${context.chat.id}`,
                    timestamp: dateToSqlTimestamp(dateAtSantiago()),
                    type: ActionType.AddAssignment,
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
        if (activeMenu !== this.name || !this.subjects.has(context.session) || !this.assignments.has(context.session)) {
            next();
            return;
        }

        const subjects = this.subjects.get(context.session) as Subject[];
        this.subjects.delete(context.session);

        const assignment = this.assignments.get(context.session) as Assignment;
        if (assignment.subject_code) {
            next();
            return;
        }

        await this.setSubject(context, subjects, assignment);
    }

    private async assignmentTypeListener(ctx: MessageContext, next: () => Promise<void>): Promise<void> {
        const context = parseContext(ctx, this.client as unknown as TelegramClient);
        const activeMenu = this.client.activeMenus.get(context.session);
        if (activeMenu !== this.name || !this.assignments.has(context.session)) {
            next();
            return;
        }

        const assignment = this.assignments.get(context.session) as Assignment;
        if (assignment.type) {
            next();
            return;
        }

        this.client.activeMenus.delete(context.session);
        await this.addAssignment(context, assignment);
    }
}
