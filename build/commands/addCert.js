"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const tables_1 = require("../tables");
const util_1 = require("../util");
const telegraf_1 = require("telegraf");
const assignmentTypes = Object.values(tables_1.AssignmentType).map(t => (0, lib_1.capitalize)(t));
const assignmentTypeRegex = new RegExp(`^(?:${assignmentTypes.join('|')})$`);
const assignmentTypesKeyboard = telegraf_1.Markup
    .keyboard(assignmentTypes)
    .oneTime()
    .resize()
    .selective()
    .reply_markup;
const args = [{
        key: 'date',
        label: 'fecha',
        description: 'La fecha de la evaluación.',
        type: lib_1.ArgumentType.Date,
        required: true,
        futureDate: true,
    }];
class AddCertCommand extends lib_1.Command {
    assignments;
    subjects;
    constructor(client) {
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
    async run(context, { date }) {
        const query = await this.client.db.select('udec_subjects', builder => builder.where({
            column: 'chat_id',
            equals: context.chat.id,
        }));
        if (!query.ok || query.result.length === 0) {
            await context.fancyReply((0, util_1.stripIndent)(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }
        this.subjects.set(context.session, query.result);
        this.client.activeMenus.set(context.session, this.name);
        const subjectsKeyboard = telegraf_1.Markup
            .keyboard(query.result.map(s => `[${s.code}] ${s.name} (${s.credits} créditos)`))
            .oneTime()
            .resize()
            .selective()
            .placeholder('/cancel para abortar.')
            .reply_markup;
        this.assignments.set(context.session, {
            'chat_id': context.chat.id,
            'date_due': date,
        });
        await context.fancyReply((0, util_1.stripIndent)(`
        _Fecha de evaluación registrada: ${(0, lib_1.dateToString)(date)}_
        \n*Selecciona la asignatura a evaluar: ⬇️*
        `), {
            'parse_mode': 'MarkdownV2',
            'reply_markup': subjectsKeyboard,
        });
    }
    async setSubject(context, subjects, assignment) {
        const code = +(context.text.match(/^\[(\d+)\]/)?.[1] ?? -1);
        const subject = subjects.find(s => s.code === code);
        if (!subject) {
            this.client.activeMenus.delete(context.session);
            this.assignments.delete(context.session);
            await context.fancyReply('No se pudo identificar la asignatura de la evaluación.', util_1.removeKeyboard);
            return;
        }
        assignment['subject_code'] = code;
        await context.fancyReply('*Elige el tipo de evaluación: ⬇️*', {
            'parse_mode': 'MarkdownV2',
            'reply_markup': assignmentTypesKeyboard,
        });
    }
    async addAssignment(context, assignment) {
        assignment.type = context.text;
        this.client.activeMenus.delete(context.session);
        const query = await this.client.db.insert('udec_assignments', builder => builder.values(assignment));
        if (!query.ok) {
            await context.fancyReply('Hubo un error al añadir la evaluación.', util_1.removeKeyboard);
            await this.client.catchError(query.error, context);
            return;
        }
        await context.fancyReply('*🎉 ¡La fecha de evaluación ha sido agregada\\!\\.*', {
            'parse_mode': 'MarkdownV2',
            ...util_1.removeKeyboard,
        });
        await this.client.db.insert('udec_actions_history', builder => builder.values({
            'chat_id': context.chat.id,
            timestamp: new Date(),
            type: tables_1.ActionType.AddAssignment,
            username: context.from.full_username,
        }));
    }
    async subjectListener(ctx, next) {
        const context = (0, lib_1.parseContext)(ctx, this.client);
        if (!this.client.activeMenus.has(context.session)
            && this.subjects.has(context.session)
            && this.assignments.has(context.session)) {
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
        if (!this.client.activeMenus.has(context.session) && this.assignments.has(context.session)) {
            next();
            return;
        }
        const assignment = this.assignments.get(context.session);
        if (assignment.type) {
            next();
            return;
        }
        await this.addAssignment(context, assignment);
    }
}
exports.default = AddCertCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkQ2VydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRDZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0NBWWdCO0FBQ2hCLHNDQUF3RjtBQUN4RixrQ0FBc0Q7QUFDdEQsdUNBQWtDO0FBRWxDLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU3RSxNQUFNLHVCQUF1QixHQUFHLGlCQUFNO0tBQ2pDLFFBQVEsQ0FBQyxlQUFlLENBQUM7S0FDekIsT0FBTyxFQUFFO0tBQ1QsTUFBTSxFQUFFO0tBQ1IsU0FBUyxFQUFFO0tBQ1gsWUFBWSxDQUFDO0FBRWxCLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLEtBQUssRUFBRSxPQUFPO1FBQ2QsV0FBVyxFQUFFLDRCQUE0QjtRQUN6QyxJQUFJLEVBQUUsa0JBQVksQ0FBQyxJQUFJO1FBQ3ZCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsVUFBVSxFQUFFLElBQUk7S0FDbkIsQ0FBc0MsQ0FBQztBQUt4QyxNQUFxQixjQUFlLFNBQVEsYUFBZ0I7SUFHdkMsV0FBVyxDQUF1QztJQUNsRCxRQUFRLENBQXNDO0lBRS9ELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsU0FBUztZQUNmLFdBQVcsRUFBRSxnQ0FBZ0M7WUFDN0MsU0FBUyxFQUFFLElBQUk7WUFDZixtQkFBbUIsRUFBRSxJQUFJO1lBQ3pCLElBQUk7U0FDUCxDQUFDLENBQUM7UUFFSCxJQUFJ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