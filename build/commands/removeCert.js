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
class RemoveCertCommand extends lib_1.Command {
    assignments;
    constructor(client) {
        super(client, {
            name: 'removecert',
            description: 'Remover un ramo del grupo.',
            groupOnly: true,
            ensureInactiveMenus: true,
        });
        this.assignments = new Map();
        client.hears(assignmentStringRegex, async (ctx, next) => {
            const context = (0, lib_1.parseContext)(ctx, client);
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
    async deleteAssignment(context, assignments) {
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
        this.client.activeMenus.delete(context.session);
        const deleted = await this.client.db.delete('udec_assignments', builder => builder.where({
            column: 'id',
            equals: assignment.id,
        }));
        if (!deleted.ok) {
            await context.fancyReply('Hubo un error al remover la evaluación.', util_1.removeKeyboard);
            await this.client.catchError(deleted.error, context);
            return;
        }
        await context.fancyReply((0, util_1.stripIndent)(`
        Removida la siguiente evaluación:

        *Tipo*: ${(0, lib_1.capitalize)(assignment.type)}
        *Ramo*: \\[${assignment.subject_code}\\] ${assignment.subject_name}
        *Fecha*: ${(0, lib_1.dateToString)(assignment.date_due)}
        `), {
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
}
exports.default = RemoveCertCommand;
function createSelectionMenu(subjects) {
    return telegraf_1.Markup
        .keyboard(subjects, {
        columns: 1,
    })
        .oneTime()
        .resize()
        .selective()
        .placeholder('/cancel para abortar.')
        .reply_markup;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlQ2VydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9yZW1vdmVDZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBR2xDLGdDQUF3SDtBQUN4SCxrQ0FBc0Q7QUFDdEQsc0NBQXlFO0FBRXpFLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxNQUFNLENBQ3BDLGVBQWUsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTztNQUM3QyxzQkFBc0IsQ0FBQyxNQUFNO01BQzdCLHFDQUFxQyxDQUFDLE1BQU0sQ0FDakQsQ0FBQztBQVFGLE1BQXFCLGlCQUFrQixTQUFRLGFBQVc7SUFHckMsV0FBVyxDQUF5QztJQUVyRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFlBQVk7WUFDbEIsV0FBVyxFQUFFLDRCQUE0QjtZQUN6QyxTQUFTLEVBQUUsSUFBSTtZQUNmLG1CQUFtQixFQUFFLElBQUk7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTdCLE1BQU0sQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNwRCxNQUFNLE9BQU8sR0FBRyxJQUFBLGtCQUFZLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxFQUFFLENB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