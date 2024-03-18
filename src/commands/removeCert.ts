import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { TelegramClientType } from '../client';
import { Command, CommandContext, SessionString, TelegramClient, capitalize, dateToString, parseContext } from '../lib';
import { removeKeyboard, stripIndent } from '../util';
import { ActionType, AssignmentObject, AssignmentType } from '../tables';

const assignmentTypes = Object.values(AssignmentType).map(v => capitalize(v));
const assignmentStringRegex = new RegExp(
    `^\\[(?<type>${assignmentTypes.join('|')})\\] `
    + /(?<subjectCode>\d+) /.source
    + /\((?<dueDate>\d{2}\/\d{2}\/\d{4})\)/.source
);

interface AssignmentMatchGroups {
    readonly type: string;
    readonly subjectCode: string;
    readonly dueDate: string;
}

export default class RemoveCertCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;
    private readonly assignments: Map<SessionString, AssignmentObject[]>;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'removecert',
            description: 'Remover un ramo del grupo.',
            groupOnly: true,
            ensureInactiveMenus: true,
        });

        this.assignments = new Map();

        client.hears(assignmentStringRegex, async (ctx, next) => {
            const context = parseContext(ctx, client);
            if (!client.activeMenus.has(context.session)) {
                next();
                return;
            }

            const assignments = this.assignments.get(context.session);
            if (!assignments) {
                next();
                return;
            }

            this.assignments.delete(context.session);
            await this.deleteAssignment(context, assignments);
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const query = await this.client.db.select('udec_assignments', builder => builder.where({
            column: 'chat_id',
            equals: context.chat.id,
        }));
        if (!query.ok || (query.ok && query.result.length === 0)) {
            await context.fancyReply(stripIndent(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }

        const assignmentsStrings = query.result.sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map(s => `[${capitalize(s.type)}] ${s.subject_code} (${dateToString(s.date_due)})`);
        const selectionMenu = createSelectionMenu(assignmentsStrings);

        this.assignments.set(context.session, query.result);
        this.client.activeMenus.set(context.session, this.name);

        await context.fancyReply(stripIndent(`
        Elige una evaluación de la lista para eliminar.

        Usa /cancel para cancelar.
        `), {
            'reply_markup': selectionMenu,
        });
    }

    private async deleteAssignment(context: CommandContext, assignments: AssignmentObject[]): Promise<void> {
        const { dueDate, subjectCode, type } = context.text
            .match(assignmentStringRegex)?.groups as unknown as AssignmentMatchGroups;

        const assignment = assignments.find(a =>
            dateToString(a.date_due) === dueDate
            && a.subject_code === +subjectCode
            && a.type === type.toLowerCase()
        );
        if (!assignment) {
            this.client.activeMenus.delete(context.session);
            await context.fancyReply('No se pudo identificar la evaluación que quieres remover.', removeKeyboard);
            return;
        }

        this.client.activeMenus.delete(context.session);
        const deleted = await this.client.db.delete('udec_assignments', builder => builder.where({
            column: 'id',
            equals: assignment.id,
        }));
        if (!deleted.ok) {
            await context.fancyReply('Hubo un error al remover la evaluación.', removeKeyboard);
            await this.client.catchError(deleted.error, context);
            return;
        }

        await context.fancyReply(stripIndent(`
        Removida la siguiente evaluación:

        *Tipo*: ${capitalize(assignment.type)}
        *Ramo*: \\[${assignment.subject_code}\\] ${assignment.subject_name}
        *Fecha*: ${dateToString(assignment.date_due)}
        `), {
            'parse_mode': 'MarkdownV2',
            ...removeKeyboard,
        });

        await this.client.db.insert('udec_actions_history', builder => builder.values({
            'chat_id': context.chat.id,
            username: context.from.full_username,
            type: ActionType.RemoveAssignment,
            timestamp: new Date(),
        }));
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
        .placeholder('/cancel para abortar.')
        .reply_markup;
}
