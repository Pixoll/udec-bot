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
        client.hears(/^\[\d+\] .+ \(\d+ créditos\)$/, (...args) => this.subjectListener(...args));
        client.hears(assignmentTypeRegex, (...args) => this.assignmentTypeListener(...args));
    }
    async run(context, { date }) {
        const subjects = await this.client.db
            .selectFrom("udec_chat_subject as chat_subject")
            .innerJoin("udec_subject as subject", "chat_subject.subject_code", "subject.code")
            .select(["subject.code", "subject.name", "subject.credits"])
            .where("chat_subject.chat_id", "=", `${context.chat.id}`)
            .execute();
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
        const code = +(context.text.match(/^\[(\d+)\]/)?.[1] ?? -1);
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
                timestamp: (0, util_1.dateToSqlTimestamp)((0, lib_1.dateAtSantiago)()),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkQ2VydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRDZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBRWxDLGdDQWFnQjtBQUNoQixzQ0FBMkY7QUFDM0Ysa0NBQStGO0FBRS9GLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU3RSxNQUFNLHVCQUF1QixHQUFHLGlCQUFNO0tBQ2pDLFFBQVEsQ0FBQyxlQUFlLENBQUM7S0FDekIsT0FBTyxFQUFFO0tBQ1QsTUFBTSxFQUFFO0tBQ1IsU0FBUyxFQUFFO0tBQ1gsV0FBVyxDQUFDLHVCQUF1QixDQUFDO0tBQ3BDLFlBQVksQ0FBQztBQUVsQixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsT0FBTztRQUNkLE1BQU0sRUFBRSxvQ0FBb0M7UUFDNUMsSUFBSSxFQUFFLGtCQUFZLENBQUMsSUFBSTtRQUN2QixRQUFRLEVBQUUsSUFBSTtRQUNkLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFFBQVEsRUFBRSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDO0tBQ0ssQ0FBVSxDQUFDO0FBS2xFLE1BQXFCLGNBQWUsU0FBUSxhQUFnQjtJQUd2QyxXQUFXLENBQW9DO0lBQy9DLFFBQVEsQ0FBZ0M7SUFFekQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsV0FBVyxFQUFFLGdDQUFnQztZQUM3QyxT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