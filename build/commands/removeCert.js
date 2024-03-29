"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const lib_1 = require("../lib");
const util_1 = require("../util");
const tables_1 = require("../tables");
const certs_1 = require("./certs");
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
        const assignmentsStrings = await Promise.all(query.result
            .sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map(async (s) => {
            const subjectName = await (0, certs_1.getSubjectName)(this.client.db, s.subject_code, context.chat.id);
            return `${(0, lib_1.capitalize)(s.type)} - [${s.subject_code}] ${subjectName} (${(0, lib_1.dateToString)(s.date_due)})`;
        }));
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
        this.waitingConfirmation.set(context.session, assignment);
        const subjectName = await (0, certs_1.getSubjectName)(this.client.db, assignment.subject_code, context.chat.id);
        await context.fancyReply((0, util_1.stripIndent)(`
        *¿Estás seguro que quieres eliminar esta evaluación?*

        *Tipo*: ${(0, lib_1.capitalize)(assignment.type)}
        *Ramo*: \\[${assignment.subject_code}\\] ${subjectName ?? 'ERROR'}
        *Fecha*: ${(0, lib_1.dateToString)(assignment.date_due)} \\(${(0, util_1.daysUntilToString)((0, util_1.getDaysUntil)(assignment.date_due))}\\)
        `), {
            'parse_mode': 'MarkdownV2',
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
    async confirmationListener(ctx, next) {
        const context = (0, lib_1.parseContext)(ctx, this.client);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlQ2VydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9yZW1vdmVDZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBR2xDLGdDQVNnQjtBQUNoQixrQ0FBdUY7QUFDdkYsc0NBQXlFO0FBQ3pFLG1DQUF5QztBQUV6QyxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLHVCQUFjLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFBLGdCQUFVLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5RSxNQUFNLHFCQUFxQixHQUFHLElBQUksTUFBTSxDQUNwQyxlQUFlLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU87TUFDN0Msc0JBQXNCLENBQUMsTUFBTTtNQUM3QixxQ0FBcUMsQ0FBQyxNQUFNLENBQ2pELENBQUM7QUFFRixNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQztBQUNyQyxNQUFNLG9CQUFvQixHQUFHLGlCQUFNO0tBQzlCLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDdkIsT0FBTyxFQUFFO0tBQ1QsTUFBTSxFQUFFO0tBQ1IsU0FBUyxFQUFFO0tBQ1gsV0FBVyxDQUFDLHVCQUF1QixDQUFDO0tBQ3BDLFlBQVksQ0FBQztBQVFsQixNQUFxQixpQkFBa0IsU0FBUSxhQUFXO0lBR3JDLFdBQVcsQ0FBeUM7SUFDcEQsbUJBQW1CLENBQXVDO0lBRTNFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsWUFBWTtZQUNsQixXQUFXLEVBQUUsNEJBQTRCO1lBQ3pDLFNBQVMsRUFBRSxJQUFJO1lBQ2YsbUJBQW1CLEVBQUUsSUFBSTtTQUM1QixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFFckMsTUFBTSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25GLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QjtRQUNwQyxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDbkYsTUFBTSxFQUFFLFNBQVM7WUFDakIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtTQUMxQixDQUFDLENBQUMsQ0FBQztRQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3ZELE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFBLGtCQUFXLEVBQUM7Ozs7YUFJcEMsQ0FBQyxDQUFDLENBQUM7WUFDSixPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNO2FBQ3BELElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUMzRCxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2IsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLHNCQUFjLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFGLE9BQU8sR0FBRyxJQUFBLGdCQUFVLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEtBQUssV0FBVyxLQUFLLElBQUEsa0JBQVksRUFBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUN0RyxDQUFDLENBQUMsQ0FDTCxDQUFDO1FBQ0YsTUFBTSxhQUFhLEdBQUcsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUU5RCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFeEQsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUEsa0JBQVcsRUFBQzs7OztTQUlwQyxDQUFDLEVBQUU7WUFDQSxjQUFjLEVBQUUsYUFBYTtTQUNoQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUF1QixFQUFFLFdBQStCO1FBQ2xGLE1BQU0sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJO2FBQzlDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE1BQTBDLENBQUM7UUFFOUUsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUNwQyxJQUFBLGtCQUFZLEVBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLE9BQU87ZUFDakMsQ0FBQyxDQUFDLFlBQVksS0FBSyxDQUFDLFdBQVc7ZUFDL0IsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQ25DLENBQUM7UUFDRixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQywyREFBMkQsRUFBRSxxQkFBYyxDQUFDLENBQUM7WUFDdEcsT0FBTztRQUNYLENBQUM7UUFFRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFMUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLHNCQUFjLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRW5HLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFBLGtCQUFXLEVBQUM7OztrQkFHM0IsSUFBQSxnQkFBVSxFQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7cUJBQ3hCLFVBQVUsQ0FBQyxZQUFZLE9BQU8sV0FBVyxJQUFJLE9BQU87bUJBQ3RELElBQUEsa0JBQVksRUFBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBQSx3QkFBaUIsRUFBQyxJQUFBLG1CQUFZLEVBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3RHLENBQUMsRUFBRTtZQUNBLFlBQVksRUFBRSxZQUFZO1lBQzFCLGNBQWMsRUFBRSxvQkFBb0I7U0FDdkMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxPQUF1QixFQUFFLFVBQTRCO1FBQ2hGLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUN2QixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsaUNBQWlDLEVBQUUscUJBQWMsQ0FBQyxDQUFDO1lBQzVFLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ3JGLE1BQU0sRUFBRSxJQUFJO1lBQ1osTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1NBQ3hCLENBQUMsQ0FBQyxDQUFDO1FBQ0osSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNkLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyx5Q0FBeUMsRUFBRSxxQkFBYyxDQUFDLENBQUM7WUFDcEYsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JELE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLHlDQUF5QyxFQUFFO1lBQ2hFLFlBQVksRUFBRSxZQUFZO1lBQzFCLEdBQUcscUJBQWM7U0FDcEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzFFLFNBQVMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYTtZQUNwQyxJQUFJLEVBQUUsbUJBQVUsQ0FBQyxnQkFBZ0I7WUFDakMsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO1NBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxHQUFtQixFQUFFLElBQXlCO1FBQzNFLE1BQU0sT0FBTyxHQUFHLElBQUEsa0JBQVksRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQW1DLENBQUMsQ0FBQztRQUM1RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hFLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUM1RSxJQUFJLEVBQUUsQ0FBQztZQUNQLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNmLElBQUksRUFBRSxDQUFDO1lBQ1AsT0FBTztRQUNYLENBQUM7UUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRU8sS0FBSyxDQUFDLG9CQUFvQixDQUFDLEdBQW1CLEVBQUUsSUFBeUI7UUFDN0UsTUFBTSxPQUFPLEdBQUcsSUFBQSxrQkFBWSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBbUMsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEUsSUFBSSxVQUFVLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNwRSxJQUFJLEVBQUUsQ0FBQztZQUNQLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsSUFBSSxFQUFFLENBQUM7WUFDUCxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakQsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7Q0FDSjtBQXhKRCxvQ0F3SkM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLFdBQXFCO0lBQzlDLE9BQU8saUJBQU07U0FDUixRQUFRLENBQUMsV0FBVyxFQUFFO1FBQ25CLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQztTQUNELE9BQU8sRUFBRTtTQUNULE1BQU0sRUFBRTtTQUNSLFNBQVMsRUFBRTtTQUNYLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQztTQUNwQyxZQUFZLENBQUM7QUFDdEIsQ0FBQyJ9