import { TelegramClientType } from '../client';
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
    dateToString,
    parseContext,
} from '../lib';
import { ActionType, AssignmentObject, AssignmentType, SubjectObject } from '../tables';
import { removeKeyboard, stripIndent } from '../util';
import { Markup } from 'telegraf';

const assignmentTypes = Object.values(AssignmentType).map(t => capitalize(t));
const assignmentTypeRegex = new RegExp(`^(?:${assignmentTypes.join('|')})$`);

const assignmentTypesKeyboard = Markup
    .keyboard(assignmentTypes)
    .oneTime()
    .resize()
    .selective()
    .placeholder('/cancel para abortar.')
    .reply_markup;

const args = [{
    key: 'date',
    label: 'fecha',
    prompt: 'Ingrese la fecha de la evaluación.',
    type: ArgumentType.Date,
    required: true,
    futureDate: true,
    examples: ['/addcert DD-MM', '/addcert 03-05'],
} as const satisfies ArgumentOptions<ArgumentType.Date>] as const;

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

export default class AddCertCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;
    private readonly assignments: Map<SessionString, AssignmentObject>;
    private readonly subjects: Map<SessionString, SubjectObject[]>;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'addcert',
            description: 'Añade una evaluación al grupo.',
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
        const query = await this.client.db.select('udec_subjects', builder => builder.where({
            column: 'chat_id',
            equals: context.chat.id,
        }));
        if (!query.ok || query.result.length === 0) {
            await context.fancyReply(stripIndent(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }

        this.subjects.set(context.session, query.result);
        this.client.activeMenus.set(context.session, this.name);

        const subjectsKeyboard = Markup
            .keyboard(query.result.map(s => `[${s.code}] ${s.name} (${s.credits} créditos)`))
            .oneTime()
            .resize()
            .selective()
            .placeholder('/cancel para abortar.')
            .reply_markup;

        this.assignments.set(context.session, {
            'chat_id': context.chat.id,
            'date_due': date,
        } as AssignmentObject);

        await context.fancyReply(stripIndent(`
        _Fecha de evaluación registrada: ${dateToString(date)}_
        \n*Selecciona la asignatura a evaluar: ⬇️*
        `), {
            'parse_mode': 'MarkdownV2',
            'reply_markup': subjectsKeyboard,
        });
    }

    private async setSubject(
        context: CommandContext, subjects: SubjectObject[], assignment: AssignmentObject
    ): Promise<void> {
        const code = +(context.text.match(/^\[(\d+)\]/)?.[1] ?? -1);
        const subject = subjects.find(s => s.code === code);
        if (!subject) {
            this.client.activeMenus.delete(context.session);
            this.assignments.delete(context.session);
            await context.fancyReply('No se pudo identificar la asignatura de la evaluación.', removeKeyboard);
            return;
        }

        assignment['subject_code'] = code;

        await context.fancyReply('*Elige el tipo de evaluación: ⬇️*', {
            'parse_mode': 'MarkdownV2',
            'reply_markup': assignmentTypesKeyboard,
        });
    }

    private async addAssignment(context: CommandContext, assignment: AssignmentObject): Promise<void> {
        assignment.type = context.text.toLowerCase() as AssignmentType;

        const exists = await this.client.db.select('udec_assignments', builder => builder
            .where({ column: 'chat_id', equals: assignment.chat_id })
            .where({ column: 'date_due', equals: assignment.date_due })
            .where({ column: 'subject_code', equals: assignment.subject_code })
            .where({ column: 'type', equals: assignment.type })
        );
        if (exists.ok && exists.result.length > 0) {
            await context.fancyReply('*La evaluación que intentas agregar ya está registrada\\.*', {
                'parse_mode': 'MarkdownV2',
                ...removeKeyboard,
            });
            return;
        }

        const inserted = await this.client.db.insert('udec_assignments', builder => builder.values(assignment));
        if (!inserted.ok) {
            await context.fancyReply('Hubo un error al añadir la evaluación.', removeKeyboard);
            await this.client.catchError(inserted.error, context);
            return;
        }

        await context.fancyReply('*🎉 ¡La fecha de evaluación ha sido agregada\\!*', {
            'parse_mode': 'MarkdownV2',
            ...removeKeyboard,
        });

        await this.client.db.insert('udec_actions_history', builder => builder.values({
            'chat_id': context.chat.id,
            timestamp: new Date(),
            type: ActionType.AddAssignment,
            username: context.from.full_username,
        }));
    }

    private async subjectListener(ctx: MessageContext, next: () => Promise<void>): Promise<void> {
        const context = parseContext(ctx, this.client as unknown as TelegramClient);
        const activeMenu = this.client.activeMenus.get(context.session);
        if (activeMenu !== this.name || !this.subjects.has(context.session) || !this.assignments.has(context.session)) {
            next();
            return;
        }

        const subjects = this.subjects.get(context.session) as SubjectObject[];
        this.subjects.delete(context.session);

        const assignment = this.assignments.get(context.session) as AssignmentObject;
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

        const assignment = this.assignments.get(context.session) as AssignmentObject;
        if (assignment.type) {
            next();
            return;
        }

        this.client.activeMenus.delete(context.session);
        await this.addAssignment(context, assignment);
    }
}
