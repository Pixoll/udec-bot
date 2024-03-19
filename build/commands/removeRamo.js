"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const lib_1 = require("../lib");
const util_1 = require("../util");
const tables_1 = require("../tables");
const confirmationRegex = /^(👍|❌)$/;
const confirmationKeyboard = telegraf_1.Markup
    .keyboard([['👍', '❌']])
    .oneTime()
    .resize()
    .selective()
    .placeholder('/cancel para abortar.')
    .reply_markup;
class RemoveRamoCommand extends lib_1.Command {
    subjects;
    waitingConfirmation;
    constructor(client) {
        super(client, {
            name: 'removeramo',
            description: 'Remover un ramo del grupo.',
            groupOnly: true,
            ensureInactiveMenus: true,
        });
        this.subjects = new Map();
        this.waitingConfirmation = new Map();
        client.hears(/^\[\d+\] .+ \(\d+ créditos\)$/, (...args) => this.subjectListener(...args));
        client.hears(confirmationRegex, (...args) => this.confirmationListener(...args));
    }
    async run(context) {
        const subjects = await this.client.db.select('udec_subjects', builder => builder.where({
            column: 'chat_id',
            equals: context.chat.id,
        }));
        if (!subjects.ok || (subjects.ok && subjects.result.length === 0)) {
            await context.fancyReply((0, util_1.stripIndent)(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }
        const subjectStrings = subjects.result.sort((0, util_1.alphabetically)('name'))
            .map(s => `[${s.code}] ${s.name} (${s.credits} créditos)`);
        const selectionMenu = createSelectionMenu(subjectStrings);
        this.subjects.set(context.session, subjects.result);
        this.client.activeMenus.set(context.session, this.name);
        await context.fancyReply((0, util_1.stripIndent)(`
        Elige el ramo a eliminar desde el menú.

        Usa /cancel para cancelar.
        `), {
            'reply_markup': selectionMenu,
        });
    }
    async confirmDeletion(context, subjects) {
        const code = +(context.text.match(/^\[(\d+)\]/)?.[1] ?? -1);
        const subject = subjects.find(s => s.code === code);
        if (!subject) {
            await context.fancyReply('No se pudo identificar el ramo que quieres remover.', util_1.removeKeyboard);
            return;
        }
        await context.fancyReply((0, util_1.stripIndent)(`
        *¿Estás seguro que quieres eliminar este ramo?*

        *Nombre*: ${subject.name}
        *Código*: ${subject.code}
        *Créditos*: ${subject.credits}
        `), {
            'reply_markup': confirmationKeyboard,
        });
    }
    async deleteSubject(context, subject) {
        if (context.text === '❌') {
            await context.fancyReply('El ramo no será removido.', util_1.removeKeyboard);
            return;
        }
        const deleted = await this.client.db.delete('udec_subjects', builder => builder
            .where({
            column: 'chat_id',
            equals: context.chat.id,
        })
            .where({
            column: 'code',
            equals: subject.code,
        }));
        if (!deleted.ok) {
            await context.fancyReply('Hubo un error al remover el ramo.', util_1.removeKeyboard);
            await this.client.catchError(deleted.error, context);
            return;
        }
        await context.fancyReply('🗑 *El ramo ha sido eliminado\\.*', {
            'parse_mode': 'MarkdownV2',
            ...util_1.removeKeyboard,
        });
        await this.client.db.insert('udec_actions_history', builder => builder.values({
            'chat_id': context.chat.id,
            username: context.from.full_username,
            type: tables_1.ActionType.RemoveSubject,
            timestamp: new Date(),
        }));
    }
    async subjectListener(ctx, next) {
        const context = (0, lib_1.parseContext)(ctx, this.client);
        if (!this.client.activeMenus.has(context.session) || this.waitingConfirmation.has(context.session)) {
            next();
            return;
        }
        const subjects = this.subjects.get(context.session);
        if (!subjects) {
            next();
            return;
        }
        this.subjects.delete(context.session);
        await this.confirmDeletion(context, subjects);
    }
    async confirmationListener(ctx, next) {
        const context = (0, lib_1.parseContext)(ctx, this.client);
        if (!this.client.activeMenus.has(context.session) || this.subjects.has(context.session)) {
            next();
            return;
        }
        const subject = this.waitingConfirmation.get(context.session);
        if (!subject) {
            next();
            return;
        }
        this.client.activeMenus.delete(context.session);
        this.waitingConfirmation.delete(context.session);
        await this.deleteSubject(context, subject);
    }
}
exports.default = RemoveRamoCommand;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9yZW1vdmVSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBR2xDLGdDQUE4RztBQUM5RyxrQ0FBc0U7QUFDdEUsc0NBQXNEO0FBRXRELE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDO0FBQ3JDLE1BQU0sb0JBQW9CLEdBQUcsaUJBQU07S0FDOUIsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN2QixPQUFPLEVBQUU7S0FDVCxNQUFNLEVBQUU7S0FDUixTQUFTLEVBQUU7S0FDWCxXQUFXLENBQUMsdUJBQXVCLENBQUM7S0FDcEMsWUFBWSxDQUFDO0FBRWxCLE1BQXFCLGlCQUFrQixTQUFRLGFBQVc7SUFHckMsUUFBUSxDQUFzQztJQUM5QyxtQkFBbUIsQ0FBb0M7SUFFeEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxZQUFZO1lBQ2xCLFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsU0FBUyxFQUFFLElBQUk7WUFDZixtQkFBbUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVyQyxNQUFNLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsSUFBSSxD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