"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const lib_1 = require("../lib");
const util_1 = require("../util");
const tables_1 = require("../tables");
const assignmentTypes = Object.values(tables_1.AssignmentType).map(v => (0, lib_1.capitalize)(v));
const assignmentStringRegex = new RegExp(`^(?<type>${assignmentTypes.join("|")}) - `
    + /\[(?<subjectCode>\d+)] .+ /.source
    + /\((?<dueDate>\d{2}\/\d{2}\/\d{4})\)$/.source);
const confirmationRegex = /^([👍❌])$/u;
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
            .map(a => ({
            ...a,
            date_due: (0, lib_1.dateAtSantiago)(a.date_due),
        }))
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
        const { dueDate, subjectCode, type, } = context.text
            .match(assignmentStringRegex)?.groups;
        const parsedDueDate = (0, util_1.dateStringToSqlDate)(dueDate);
        const assignment = assignments.find(a => a.date_due === parsedDueDate
            && a.subject_code === +subjectCode
            && a.type === type.toLowerCase());
        if (!assignment) {
            this.client.activeMenus.delete(context.session);
            await context.fancyReply("No se pudo identificar la evaluación que quieres remover.", util_1.removeKeyboard);
            return;
        }
        this.waitingConfirmation.set(context.session, assignment);
        await context.fancyReply((0, util_1.stripIndent)(`
        *¿Estás seguro que quieres eliminar esta evaluación?*

        *Tipo*: ${(0, lib_1.capitalize)(assignment.type)}
        *Ramo*: \\[${assignment.subject_code}\\] ${assignment.subject_name}
        *Fecha*: ${dueDate} \\(${(0, util_1.daysUntilToString)((0, util_1.getDaysUntil)((0, lib_1.dateAtSantiago)(assignment.date_due)))}\\)
        `), {
            "parse_mode": "MarkdownV2",
            "reply_markup": confirmationKeyboard,
        });
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
                timestamp: (0, lib_1.timestampAtSantiago)(),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlQ2VydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9yZW1vdmVDZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBR2xDLGdDQVdnQjtBQUNoQixrQ0FBNEc7QUFDNUcsc0NBQTRFO0FBTTVFLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxNQUFNLENBQ3BDLFlBQVksZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTTtNQUN6Qyw0QkFBNEIsQ0FBQyxNQUFNO01BQ25DLHNDQUFzQyxDQUFDLE1BQU0sQ0FDbEQsQ0FBQztBQUVGLE1BQU0saUJBQWlCLEdBQUcsWUFBWSxDQUFDO0FBQ3ZDLE1BQU0sb0JBQW9CLEdBQUcsaUJBQU07S0FDOUIsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN2QixPQUFPLEVBQUU7S0FDVCxNQUFNLEVBQUU7S0FDUixTQUFTLEVBQUU7S0FDWCxXQUFXLENBQUMsdUJBQXVCLENBQUM7S0FDcEMsWUFBWSxDQUFDO0FBU2xCLE1BQXFCLGlCQUFrQixTQUFRLGFBQU87SUFHakMsV0FBVyxDQUFrRDtJQUM3RCxtQkFBbUIsQ0FBZ0Q7SUFFcEYsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxZQUFZO1lBQ2xCLFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsU0FBUyxFQUFFLElBQUk7WUFDZixtQkFBbUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM3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