"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const lib_1 = require("../lib");
const tables_1 = require("../tables");
const util_1 = require("../util");
const assignmentTypes = Object.values(tables_1.AssignmentType).map(t => (0, lib_1.capitalize)(t));
const assignmentTypeRegex = new RegExp(`^(?:${assignmentTypes.join("|")})$`);
const assignmentTypesKeyboard = telegraf_1.Markup
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
        type: lib_1.ArgumentType.Date,
        required: true,
        futureDate: true,
        examples: ["/addcert DD-MM", "/addcert 03-05"],
    }];
class AddCertCommand extends lib_1.Command {
    assignments;
    subjects;
    constructor(client) {
        super(client, {
            name: "addcert",
            description: "Añade una evaluación al grupo.",
            groupOnly: true,
            ensureInactiveMenus: true,
            args,
        });
        this.assignments = new Map();
        this.subjects = new Map();
        client.hears(/^\[\d+] .+ \(\d+ créditos\)$/, (...args) => this.subjectListener(...args));
        client.hears(assignmentTypeRegex, (...args) => this.assignmentTypeListener(...args));
    }
    async run(context, { date }) {
        const subjects = await (0, util_1.getSubjects)(this.client, context);
        if (subjects.length === 0) {
            await context.fancyReply((0, util_1.stripIndent)(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }
        this.subjects.set(context.session, subjects);
        this.client.activeMenus.set(context.session, this.name);
        const subjectsKeyboard = telegraf_1.Markup
            .keyboard(subjects.map(s => `[${s.code}] ${s.name} (${s.credits} créditos)`))
            .oneTime()
            .resize()
            .selective()
            .placeholder("/cancel para abortar.")
            .reply_markup;
        this.assignments.set(context.session, {
            chat_id: `${context.chat.id}`,
            date_due: (0, util_1.dateStringToSqlDate)((0, lib_1.dateToString)(date)),
        });
        await context.fancyReply((0, util_1.stripIndent)(`
        _Fecha de evaluación registrada: ${(0, lib_1.dateToString)(date)}_
        \n*Selecciona la asignatura a evaluar: ⬇️*
        `), {
            "parse_mode": "MarkdownV2",
            "reply_markup": subjectsKeyboard,
        });
    }
    async setSubject(context, subjects, assignment) {
        const code = +(context.text.match(/^\[(\d+)]/)?.[1] ?? -1);
        const subject = subjects.find(s => s.code === code);
        if (!subject) {
            this.client.activeMenus.delete(context.session);
            this.assignments.delete(context.session);
            await context.fancyReply("No se pudo identificar la asignatura de la evaluación.", util_1.removeKeyboard);
            return;
        }
        assignment["subject_code"] = code;
        await context.fancyReply("*Elige el tipo de evaluación: ⬇️*", {
            "parse_mode": "MarkdownV2",
            "reply_markup": assignmentTypesKeyboard,
        });
    }
    async addAssignment(context, assignment) {
        assignment.type = context.text.toLowerCase();
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
                ...util_1.removeKeyboard,
            });
            return;
        }
        try {
            await this.client.db
                .insertInto("udec_assignment")
                .values(assignment)
                .executeTakeFirstOrThrow();
        }
        catch (error) {
            await context.fancyReply("Hubo un error al añadir la evaluación.", util_1.removeKeyboard);
            await this.client.catchError(error, context);
            return;
        }
        await context.fancyReply("*🎉 ¡La fecha de evaluación ha sido agregada\\!*", {
            "parse_mode": "MarkdownV2",
            ...util_1.removeKeyboard,
        });
        try {
            await this.client.db
                .insertInto("udec_action_history")
                .values({
                chat_id: `${context.chat.id}`,
                timestamp: (0, lib_1.timestampAtSantiago)(),
                type: tables_1.ActionType.AddAssignment,
                username: context.from.full_username,
            })
                .executeTakeFirstOrThrow();
        }
        catch (error) {
            await this.client.catchError(error, context);
        }
    }
    async subjectListener(ctx, next) {
        const context = (0, lib_1.parseContext)(ctx, this.client);
        const activeMenu = this.client.activeMenus.get(context.session);
        if (activeMenu !== this.name || !this.subjects.has(context.session) || !this.assignments.has(context.session)) {
            next();
            return;
        }
        const subjects = this.subjects.get(context.session);
        this.subjects.delete(context.session);
        const assignment = this.assignments.get(context.session);
        if (assignment.subject_code) {
            next();
            return;
        }
        await this.setSubject(context, subjects, assignment);
    }
    async assignmentTypeListener(ctx, next) {
        const context = (0, lib_1.parseContext)(ctx, this.client);
        const activeMenu = this.client.activeMenus.get(context.session);
        if (activeMenu !== this.name || !this.assignments.has(context.session)) {
            next();
            return;
        }
        const assignment = this.assignments.get(context.session);
        if (assignment.type) {
            next();
            return;
        }
        this.client.activeMenus.delete(context.session);
        await this.addAssignment(context, assignment);
    }
}
exports.default = AddCertCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkQ2VydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRDZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBRWxDLGdDQWFnQjtBQUNoQixzQ0FBMkY7QUFDM0Ysa0NBQXdGO0FBRXhGLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU3RSxNQUFNLHVCQUF1QixHQUFHLGlCQUFNO0tBQ2pDLFFBQVEsQ0FBQyxlQUFlLENBQUM7S0FDekIsT0FBTyxFQUFFO0tBQ1QsTUFBTSxFQUFFO0tBQ1IsU0FBUyxFQUFFO0tBQ1gsV0FBVyxDQUFDLHVCQUF1QixDQUFDO0tBQ3BDLFlBQVksQ0FBQztBQUVsQixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsT0FBTztRQUNkLE1BQU0sRUFBRSxvQ0FBb0M7UUFDNUMsSUFBSSxFQUFFLGtCQUFZLENBQUMsSUFBSTtRQUN2QixRQUFRLEVBQUUsSUFBSTtRQUNkLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFFBQVEsRUFBRSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDO0tBQ0ssQ0FBVSxDQUFDO0FBTWxFLE1BQXFCLGNBQWUsU0FBUSxhQUFnQjtJQUd2QyxXQUFXLENBQW9DO0lBQy9DLFFBQVEsQ0FBZ0M7SUFFekQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsV0FBVyxFQUFFLGdDQUFnQztZQUM3QyxT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