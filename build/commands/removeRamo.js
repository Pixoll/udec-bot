"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const lib_1 = require("../lib");
const util_1 = require("../util");
const tables_1 = require("../tables");
const confirmationRegex = /^([👍❌])$/u;
const confirmationKeyboard = telegraf_1.Markup
    .keyboard([["👍", "❌"]])
    .oneTime()
    .resize()
    .selective()
    .placeholder("/cancel para abortar.")
    .reply_markup;
class RemoveRamoCommand extends lib_1.Command {
    subjects;
    waitingConfirmation;
    constructor(client) {
        super(client, {
            name: "removeramo",
            description: "Remover un ramo del grupo.",
            groupOnly: true,
            ensureInactiveMenus: true,
        });
        this.subjects = new Map();
        this.waitingConfirmation = new Map();
        client.hears(/^\[\d+] .+ \(\d+ créditos\)$/, (...args) => this.subjectListener(...args));
        client.hears(confirmationRegex, (...args) => this.confirmationListener(...args));
    }
    async run(context) {
        const subjects = await (0, util_1.getSubjects)(this.client, context);
        if (subjects.length === 0) {
            await context.fancyReply((0, util_1.stripIndent)(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }
        const subjectStrings = subjects.sort((0, util_1.alphabetically)("name"))
            .map(s => `[${s.code}] ${s.name} (${s.credits} créditos)`);
        const selectionMenu = createSelectionMenu(subjectStrings);
        this.subjects.set(context.session, subjects);
        this.client.activeMenus.set(context.session, this.name);
        await context.fancyReply((0, util_1.stripIndent)(`
        Elige el ramo a eliminar desde el menú.

        Usa /cancel para cancelar.
        `), {
            "reply_markup": selectionMenu,
        });
    }
    async confirmDeletion(context, subjects) {
        const code = +(context.text.match(/^\[(\d+)]/)?.[1] ?? -1);
        const subject = subjects.find(s => s.code === code);
        if (!subject) {
            await context.fancyReply("No se pudo identificar el ramo que quieres remover.", util_1.removeKeyboard);
            return;
        }
        this.waitingConfirmation.set(context.session, subject);
        await context.fancyReply((0, util_1.stripIndent)(`
        *¿Estás seguro que quieres eliminar este ramo?*

        *Nombre*: ${subject.name}
        *Código*: ${subject.code}
        *Créditos*: ${subject.credits}
        `), {
            "parse_mode": "MarkdownV2",
            "reply_markup": confirmationKeyboard,
        });
    }
    async deleteSubject(context, subject) {
        if (context.text === "❌") {
            await context.fancyReply("El ramo no será removido.", util_1.removeKeyboard);
            return;
        }
        const registeredAssignments = await this.client.db
            .selectFrom("udec_assignment")
            .selectAll()
            .where("chat_id", "=", `${context.chat.id}`)
            .where("subject_code", "=", subject.code)
            .execute();
        if (registeredAssignments.length > 0) {
            await context.fancyReply((0, util_1.stripIndent)(`
            *No se puede eliminar este ramo\\.*

            Aún existen evaluaciones vigentes vinculadas a este ramo\\. Elimina esas primero con /removecert\\.
            `), {
                "parse_mode": "MarkdownV2",
                ...util_1.removeKeyboard,
            });
            return;
        }
        try {
            await this.client.db
                .deleteFrom("udec_chat_subject")
                .where("chat_id", "=", `${context.chat.id}`)
                .where("subject_code", "=", subject.code)
                .executeTakeFirstOrThrow();
        }
        catch (error) {
            await context.fancyReply("Hubo un error al remover el ramo.", util_1.removeKeyboard);
            await this.client.catchError(error, context);
            return;
        }
        await context.fancyReply("🗑 *El ramo ha sido eliminado\\.*", {
            "parse_mode": "MarkdownV2",
            ...util_1.removeKeyboard,
        });
        try {
            await this.client.db
                .insertInto("udec_action_history")
                .values({
                chat_id: `${context.chat.id}`,
                timestamp: (0, lib_1.timestampAtSantiago)(),
                type: tables_1.ActionType.RemoveSubject,
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
        if (activeMenu !== this.name || this.waitingConfirmation.has(context.session)) {
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
        const activeMenu = this.client.activeMenus.get(context.session);
        if (activeMenu !== this.name || this.subjects.has(context.session)) {
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
        .placeholder("/cancel para abortar.")
        .reply_markup;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9yZW1vdmVSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQWtDO0FBR2xDLGdDQVFnQjtBQUNoQixrQ0FBbUY7QUFDbkYsc0NBQWdEO0FBRWhELE1BQU0saUJBQWlCLEdBQUcsWUFBWSxDQUFDO0FBQ3ZDLE1BQU0sb0JBQW9CLEdBQUcsaUJBQU07S0FDOUIsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN2QixPQUFPLEVBQUU7S0FDVCxNQUFNLEVBQUU7S0FDUixTQUFTLEVBQUU7S0FDWCxXQUFXLENBQUMsdUJBQXVCLENBQUM7S0FDcEMsWUFBWSxDQUFDO0FBR2xCLE1BQXFCLGlCQUFrQixTQUFRLGFBQU87SUFHakMsUUFBUSxDQUFnQztJQUN4QyxtQkFBbUIsQ0FBOEI7SUFFbEUsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxZQUFZO1lBQ2xCLFdBQVcsRUFBRSw0QkFBNEI7WUFDekMsU0FBUyxFQUFFLElBQUk7WUFDZixtQkFBbUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVyQyxNQUFNLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsSUFBSSxD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