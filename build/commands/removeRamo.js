"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const lib_1 = require("../lib");
const util_1 = require("../util");
const tables_1 = require("../tables");
class RemoveRamoCommand extends lib_1.Command {
    subjects;
    constructor(client) {
        super(client, {
            name: 'removeramo',
            description: 'Remover un ramo del grupo.',
            groupOnly: true,
            ensureInactiveMenus: true,
        });
        this.subjects = new Map();
        client.hears(/^\[\d+\] .+ \(\d+ créditos\)$/, async (ctx, next) => {
            const context = (0, lib_1.parseContext)(ctx, client);
            if (!client.activeMenus.has(context.session)) {
                next();
                return;
            }
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
            await context.fancyReply('No se pudo identificar el ramo que quieres remover.', util_1.removeKeyboard);
            return;
        }
        this.client.activeMenus.delete(context.session);
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
            await context.fancyReply('Hubo un error al remover el ramo.', util_1.removeKeyboard);
            await this.client.catchError(deleted.error, context);
            return;
        }
        await context.fancyReply((0, util_1.stripIndent)(`
        Removido el siguiente ramo:

        *Nombre*: ${subject.name}
        *Código*: ${code}
        *Créditos*: ${subject.credits}
        `), {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9yZW1vdmVSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBR2xDLGdDQUE4RjtBQUM5RixrQ0FBc0U7QUFDdEUsc0NBQXNEO0FBRXRELE1BQXFCLGlCQUFrQixTQUFRLGFBQVc7SUFHckMsUUFBUSxDQUFzQztJQUUvRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFlBQVk7WUFDbEIsV0FBVyxFQUFFLDRCQUE0QjtZQUN6QyxTQUFTLEVBQUUsSUFBSTtZQUNmLG1CQUFtQixFQUFFLElBQUk7U0FDNUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTFCLE1BQU0sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUM5RCxNQUFNLE9BQU8sR0FBRyxJQUFBLGtCQUFZLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsT0FBTztZQUNYLENBQUM7WUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNaLElBQUksRUFBRSxDQUFDO2dCQUNQLE9BQU87WUFDWCxDQUFDO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sSUFBSSxDQUFDLGFBQWEs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