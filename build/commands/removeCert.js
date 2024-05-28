"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const lib_1 = require("../lib");
const util_1 = require("../util");
const tables_1 = require("../tables");
const assignmentTypes = Object.values(tables_1.AssignmentType).map(v => (0, lib_1.capitalize)(v));
const assignmentStringRegex = new RegExp(`^(?<type>${assignmentTypes.join("|")}) - `
    + /\[(?<subjectCode>\d+)\] [\w ]+ /.source
    + /\((?<dueDate>\d{2}\/\d{2}\/\d{4})\)/.source);
const confirmationRegex = /^(👍|❌)$/;
const confirmationKeyboard = telegraf_1.Markup
    .keyboard([["👍", "❌"]])
    .oneTime()
    .resize()
    .selective()
    .placeholder("/cancel para abortar.")
    .reply_markup;
class RemoveCertCommand extends lib_1.Command {
    assignments;
    waitingConfirmation;
    constructor(client) {
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
    async run(context) {
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
            await context.fancyReply((0, util_1.stripIndent)(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }
        const assignmentsStrings = assignments
            .map(a => ({ ...a, date_due: (0, lib_1.dateAtSantiago)(a.date_due) }))
            .sort((a, b) => a.date_due.getTime() - b.date_due.getTime())
            .map((s) => `${(0, lib_1.capitalize)(s.type)} - [${s.subject_code}] ${s.subject_name} (${(0, lib_1.dateToString)(s.date_due)})`);
        this.assignments.set(context.session, assignments);
        this.client.activeMenus.set(context.session, this.name);
        await context.fancyReply((0, util_1.stripIndent)(`
        Elige una evaluación de la lista para eliminar.

        Usa /cancel para cancelar.
        `), {
            "reply_markup": createSelectionMenu(assignmentsStrings),
        });
    }
    async confirmDeletion(context, assignments) {
        const { dueDate, subjectCode, type } = context.text
            .match(assignmentStringRegex)?.groups;
        const assignment = assignments.find(a => a.date_due === dueDate.replace(/^\d/g, "-")
            && a.subject_code === +subjectCode
            && a.type === type.toLowerCase());
        if (!assignment) {
            this.client.activeMenus.delete(context.session);
            await context.fancyReply("No se pudo identificar la evaluación que quieres remover.", util_1.removeKeyboard);
            return;
        }
        this.waitingConfirmation.set(context.session, assignment);
        /* eslint-disable indent */
        await context.fancyReply((0, util_1.stripIndent)(`
        *¿Estás seguro que quieres eliminar esta evaluación?*

        *Tipo*: ${(0, lib_1.capitalize)(assignment.type)}
        *Ramo*: \\[${assignment.subject_code}\\] ${assignment.subject_name}
        *Fecha*: ${assignment.date_due.replace(/-/g, "/")} \\(${(0, util_1.daysUntilToString)((0, util_1.getDaysUntil)((0, lib_1.dateAtSantiago)(assignment.date_due)))}\\)
        `), {
            "parse_mode": "MarkdownV2",
            "reply_markup": confirmationKeyboard,
        });
        /* eslint-enable indent */
    }
    async deleteAssignment(context, assignment) {
        if (context.text === "❌") {
            await context.fancyReply("La evaluación no será removida.", util_1.removeKeyboard);
            return;
        }
        try {
            await this.client.db
                .deleteFrom("udec_assignment")
                .where("id", "=", assignment.id)
                .executeTakeFirstOrThrow();
        }
        catch (error) {
            await context.fancyReply("Hubo un error al remover la evaluación.", util_1.removeKeyboard);
            await this.client.catchError(error, context);
            return;
        }
        await context.fancyReply("🗑 *La evaluación ha sido eliminada\\.*", {
            "parse_mode": "MarkdownV2",
            ...util_1.removeKeyboard,
        });
        try {
            await this.client.db
                .insertInto("udec_action_history")
                .values({
                chat_id: `${context.chat.id}`,
                timestamp: (0, lib_1.dateAtSantiago)().toISOString().replace(/T|\.\d{3}Z$/g, ""),
                type: tables_1.ActionType.RemoveAssignment,
                username: context.from.full_username,
            })
                .executeTakeFirstOrThrow();
        }
        catch (error) {
            await this.client.catchError(error, context);
        }
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
        .placeholder("/cancel para abortar.")
        .reply_markup;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlQ2VydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9yZW1vdmVDZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBR2xDLGdDQVVnQjtBQUNoQixrQ0FBdUY7QUFDdkYsc0NBQTRFO0FBTTVFLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxNQUFNLENBQ3BDLFlBQVksZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTTtNQUN6QyxpQ0FBaUMsQ0FBQyxNQUFNO01BQ3hDLHFDQUFxQyxDQUFDLE1BQU0sQ0FDakQsQ0FBQztBQUVGLE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDO0FBQ3JDLE1BQU0sb0JBQW9CLEdBQUcsaUJBQU07S0FDOUIsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN2QixPQUFPLEVBQUU7S0FDVCxNQUFNLEVBQUU7S0FDUixTQUFTLEVBQUU7S0FDWCxXQUFXLENBQUMsdUJBQXVCLENBQUM7S0FDcEMsWUFBWSxDQUFDO0FBUWxCLE1BQXFCLGlCQUFrQixTQUFRLGFBQVc7SUFHckMsV0FBVyxDQUFrRDtJQUM3RCxtQkFBbUIsQ0FBZ0Q7SUFFcEYsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxZQUFZO1lBQ2xCLFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsU0FBUyxFQUFFLElBQUk7WUFDZixtQkFBbUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM3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