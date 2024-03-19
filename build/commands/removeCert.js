"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const lib_1 = require("../lib");
const util_1 = require("../util");
const tables_1 = require("../tables");
const assignmentTypes = Object.values(tables_1.AssignmentType).map(v => (0, lib_1.capitalize)(v));
const assignmentStringRegex = new RegExp(`^\\[(?<type>${assignmentTypes.join('|')})\\] `
    + /(?<subjectCode>\d+) /.source
    + /\((?<dueDate>\d{2}\/\d{2}\/\d{4})\)/.source);
const confirmationRegex = /^(👍|❌)$/;
const confirmationKeyboard = telegraf_1.Markup
    .keyboard([['👍', '❌']])
    .oneTime()
    .resize()
    .selective()
    .placeholder('/cancel para abortar.')
    .reply_markup;
class RemoveCertCommand extends lib_1.Command {
    assignments;
    waitingConfirmation;
    constructor(client) {
        super(client, {
            name: 'removecert',
            description: 'Remover un ramo del grupo.',
            groupOnly: true,
            ensureInactiveMenus: true,
        });
        this.assignments = new Map();
        this.waitingConfirmation = new Map();
        client.hears(assignmentStringRegex, (...args) => this.assignmentListener(...args));
        client.hears(confirmationRegex, (...args) => this.confirmationListener(...args));
    }
    async run(context) {
        const query = await this.client.db.select('udec_assignments', builder => builder.where({
            column: 'chat_id',
            equals: context.chat.id,
        }));
        if (!query.ok || (query.ok && query.result.length === 0)) {
            await context.fancyReply((0, util_1.stripIndent)(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }
        const assignmentsStrings = query.result.sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map(s => `[${(0, lib_1.capitalize)(s.type)}] ${s.subject_code} (${(0, lib_1.dateToString)(s.date_due)})`);
        const selectionMenu = createSelectionMenu(assignmentsStrings);
        this.assignments.set(context.session, query.result);
        this.client.activeMenus.set(context.session, this.name);
        await context.fancyReply((0, util_1.stripIndent)(`
        Elige una evaluación de la lista para eliminar.

        Usa /cancel para cancelar.
        `), {
            'reply_markup': selectionMenu,
        });
    }
    async confirmDeletion(context, assignments) {
        const { dueDate, subjectCode, type } = context.text
            .match(assignmentStringRegex)?.groups;
        const assignment = assignments.find(a => (0, lib_1.dateToString)(a.date_due) === dueDate
            && a.subject_code === +subjectCode
            && a.type === type.toLowerCase());
        if (!assignment) {
            this.client.activeMenus.delete(context.session);
            await context.fancyReply('No se pudo identificar la evaluación que quieres remover.', util_1.removeKeyboard);
            return;
        }
        await context.fancyReply((0, util_1.stripIndent)(`
        *¿Estás seguro que quieres eliminar esta evaluación?*

        *Tipo*: ${(0, lib_1.capitalize)(assignment.type)}
        *Ramo*: \\[${assignment.subject_code}\\] ${assignment.subject_name}
        *Fecha*: ${(0, lib_1.dateToString)(assignment.date_due)} (${(0, util_1.daysUntilToString)((0, util_1.getDaysUntil)(assignment.date_due))})
        `), {
            'reply_markup': confirmationKeyboard,
        });
    }
    async deleteAssignment(context, assignment) {
        if (context.text === '❌') {
            await context.fancyReply('La evaluación no será removida.', util_1.removeKeyboard);
            return;
        }
        const deleted = await this.client.db.delete('udec_assignments', builder => builder.where({
            column: 'id',
            equals: assignment.id,
        }));
        if (!deleted.ok) {
            await context.fancyReply('Hubo un error al remover la evaluación.', util_1.removeKeyboard);
            await this.client.catchError(deleted.error, context);
            return;
        }
        await context.fancyReply('🗑 *La evaluación ha sido eliminada\\.*', {
            'parse_mode': 'MarkdownV2',
            ...util_1.removeKeyboard,
        });
        await this.client.db.insert('udec_actions_history', builder => builder.values({
            'chat_id': context.chat.id,
            username: context.from.full_username,
            type: tables_1.ActionType.RemoveAssignment,
            timestamp: new Date(),
        }));
    }
    async assignmentListener(ctx, next) {
        const context = (0, lib_1.parseContext)(ctx, this.client);
        if (!this.client.activeMenus.has(context.session) || this.waitingConfirmation.has(context.session)) {
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
    async confirmationListener(ctx, next) {
        const context = (0, lib_1.parseContext)(ctx, this.client);
        if (!this.client.activeMenus.has(context.session) || this.assignments.has(context.session)) {
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
exports.default = RemoveCertCommand;
function createSelectionMenu(assignments) {
    return telegraf_1.Markup
        .keyboard(assignments, {
        columns: 1,
    })
        .oneTime()
        .resize()
        .selective()
        .placeholder('/cancel para abortar.')
        .reply_markup;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlQ2VydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9yZW1vdmVDZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBR2xDLGdDQVNnQjtBQUNoQixrQ0FBdUY7QUFDdkYsc0NBQXlFO0FBRXpFLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxNQUFNLENBQ3BDLGVBQWUsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTztNQUM3QyxzQkFBc0IsQ0FBQyxNQUFNO01BQzdCLHFDQUFxQyxDQUFDLE1BQU0sQ0FDakQsQ0FBQztBQUVGLE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDO0FBQ3JDLE1BQU0sb0JBQW9CLEdBQUcsaUJBQU07S0FDOUIsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN2QixPQUFPLEVBQUU7S0FDVCxNQUFNLEVBQUU7S0FDUixTQUFTLEVBQUU7S0FDWCxXQUFXLENBQUMsdUJBQXVCLENBQUM7S0FDcEMsWUFBWSxDQUFDO0FBUWxCLE1BQXFCLGlCQUFrQixTQUFRLGFBQVc7SUFHckMsV0FBVyxDQUF5QztJQUNwRCxtQkFBbUIsQ0FBdUM7SUFFM0UsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxZQUFZO1lBQ2xCLFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsU0FBUyxFQUFFLElBQUk7WUFDZixtQkFBbUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM3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