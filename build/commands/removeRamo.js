"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const lib_1 = require("../lib");
const util_1 = require("../util");
const tables_1 = require("../tables");
const removeKeyboard = {
    'reply_markup': {
        'remove_keyboard': true,
    },
};
class RemoveRamoCommand extends lib_1.Command {
    subjects;
    constructor(client) {
        super(client, {
            name: 'removeramo',
            description: 'Remover un ramo del grupo.',
            groupOnly: true,
        });
        this.subjects = new Map();
        client.hears(/^\[\d+\] .+ \(\d+ créditos\)$/, async (ctx, next) => {
            const context = (0, lib_1.parseContext)(ctx, client);
            const subjects = this.subjects.get(context.session);
            if (!subjects) {
                next();
                return;
            }
            this.subjects.delete(context.session);
            await this.deleteSubject(context, subjects);
        });
    }
    async run(context) {
        if (this.client.activeMenus.has(context.session)) {
            await context.fancyReply('Ya tienes un menú activo. Usa /cancel para cerrarlo.');
            return;
        }
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
    async deleteSubject(context, subjects) {
        const code = +(context.text.match(/^\[(\d+)\]/)?.[1] ?? -1);
        const subject = subjects.find(s => s.code === code);
        if (!subject) {
            this.client.activeMenus.delete(context.session);
            await context.fancyReply('No se pudo identificar el ramo que quieres remover.', removeKeyboard);
            return;
        }
        const deleted = await this.client.db.delete('udec_subjects', builder => builder
            .where({
            column: 'chat_id',
            equals: context.chat.id,
        })
            .where({
            column: 'code',
            equals: code,
        }));
        if (!deleted.ok) {
            this.client.activeMenus.delete(context.session);
            await this.client.catchError(deleted.error, context, removeKeyboard);
            return;
        }
        this.client.activeMenus.delete(context.session);
        await context.fancyReply((0, util_1.stripIndent)(`
        Removido el siguiente ramo:

        *Nombre*: ${subject.name}
        *Código*: ${code}
        *Créditos*: ${subject.credits}
        `), {
            'parse_mode': 'MarkdownV2',
            ...removeKeyboard,
        });
        await this.client.db.insert('udec_actions_history', builder => builder.values({
            'chat_id': context.chat.id,
            username: context.from.full_username,
            type: tables_1.ActionType.RemoveSubject,
            timestamp: new Date(),
        }));
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
        .reply_markup;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9yZW1vdmVSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBR2xDLGdDQUFxSDtBQUNySCxrQ0FBc0Q7QUFDdEQsc0NBQXNEO0FBS3RELE1BQU0sY0FBYyxHQUFHO0lBQ25CLGNBQWMsRUFBRTtRQUNaLGlCQUFpQixFQUFFLElBQUk7S0FDMUI7Q0FDaUMsQ0FBQztBQUV2QyxNQUFxQixpQkFBa0IsU0FBUSxhQUFXO0lBR3JDLFFBQVEsQ0FBc0M7SUFFL0QsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxZQUFZO1lBQ2xCLFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsU0FBUyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTFCLE1BQU0sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUM5RCxNQUFNLE9BQU8sR0FBRyxJQUFBLGtCQUFZLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ1osSUFBSSxFQUFFLENBQUM7Z0JBQ1AsT0FBTztZQUNYLENBQUM7WUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFF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