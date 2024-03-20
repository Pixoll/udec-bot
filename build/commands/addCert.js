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
    .placeholder('/cancel para abortar.')
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
        Object.assign(assignment, {
            'subject_code': code,
            'subject_name': subject.name,
        });
        await context.fancyReply('*Elige el tipo de evaluación: ⬇️*', {
            'parse_mode': 'MarkdownV2',
            'reply_markup': assignmentTypesKeyboard,
        });
    }
    async addAssignment(context, assignment) {
        assignment.type = context.text.toLowerCase();
        const exists = await this.client.db.select('udec_assignments', builder => builder
            .where({ column: 'chat_id', equals: assignment.chat_id })
            .where({ column: 'date_due', equals: assignment.date_due })
            .where({ column: 'subject_code', equals: assignment.subject_code })
            .where({ column: 'type', equals: assignment.type }));
        if (exists.ok && exists.result.length > 0) {
            await context.fancyReply('*La evaluación que intentas agregar ya está registrada\\.*', {
                'parse_mode': 'MarkdownV2',
                ...util_1.removeKeyboard,
            });
            return;
        }
        const inserted = await this.client.db.insert('udec_assignments', builder => builder.values(assignment));
        if (!inserted.ok) {
            await context.fancyReply('Hubo un error al añadir la evaluación.', util_1.removeKeyboard);
            await this.client.catchError(inserted.error, context);
            return;
        }
        await context.fancyReply('*🎉 ¡La fecha de evaluación ha sido agregada\\!*', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkQ2VydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRDZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0NBWWdCO0FBQ2hCLHNDQUF3RjtBQUN4RixrQ0FBc0Q7QUFDdEQsdUNBQWtDO0FBRWxDLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsZ0JBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU3RSxNQUFNLHVCQUF1QixHQUFHLGlCQUFNO0tBQ2pDLFFBQVEsQ0FBQyxlQUFlLENBQUM7S0FDekIsT0FBTyxFQUFFO0tBQ1QsTUFBTSxFQUFFO0tBQ1IsU0FBUyxFQUFFO0tBQ1gsV0FBVyxDQUFDLHVCQUF1QixDQUFDO0tBQ3BDLFlBQVksQ0FBQztBQUVsQixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsT0FBTztRQUNkLFdBQVcsRUFBRSw0QkFBNEI7UUFDekMsSUFBSSxFQUFFLGtCQUFZLENBQUMsSUFBSTtRQUN2QixRQUFRLEVBQUUsSUFBSTtRQUNkLFVBQVUsRUFBRSxJQUFJO0tBQ21DLENBQVUsQ0FBQztBQUtsRSxNQUFxQixjQUFlLFNBQVEsYUFBZ0I7SUFHdkMsV0FBVyxDQUF1QztJQUNsRCxRQUFRLENBQXNDO0lBRS9ELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsU0FBUztZQUNmLFdBQVcsRUFBRSxnQ0FBZ0M7WUFDN0MsU0FBUyxFQUFFLElBQUk7WUFDZixtQkFBbUIsRUFBRSxJQUFJO1lBQ3pCLElB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