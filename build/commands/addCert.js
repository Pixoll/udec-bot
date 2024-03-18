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
        assignment.type = context.text.toLowerCase();
        this.client.activeMenus.delete(context.session);
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