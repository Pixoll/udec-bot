import { Markup } from 'telegraf';
import { ReplyKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { TelegramClientType } from '../client';
import { Command, CommandContext, SessionString, TableColumnValuePairs, TelegramClient, parseContext } from '../lib';
import { alphabetically, stripIndent } from '../util';
import { SubjectsTable } from '../tables';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

type SubjectObject = TableColumnValuePairs<SubjectsTable>;

const removeKeyboard = {
    'reply_markup': {
        'remove_keyboard': true,
    },
} as const satisfies ExtraReplyMessage;

export default class RemoveRamoCommand extends Command<[]> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;
    private readonly subjects: Map<SessionString, SubjectObject[]>;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'removeramo',
            description: 'Remover un ramo del grupo.',
            groupOnly: true,
        });

        this.subjects = new Map();

        client.hears(/^\[\d+\] .+ \(\d+ créditos\)$/, async (ctx, next) => {
            const context = parseContext(ctx, client);
            const subjects = this.subjects.get(context.session);
            if (!subjects) {
                next();
                return;
            }

            this.subjects.delete(context.session);
            await this.deleteSubject(context, subjects);
        });
    }

    public async run(context: CommandContext): Promise<void> {
        if (this.client.activeMenus.has(context.session)) {
            await context.fancyReply('Ya tienes un menú activo. Usa /cancel para cerrarlo.');
            return;
        }

        const subjects = await this.client.db.select('udec_subjects', builder => builder.where({
            column: 'chat_id',
            equals: context.chat.id,
        }));
        if (!subjects.ok || (subjects.ok && subjects.result.length === 0)) {
            await context.fancyReply(stripIndent(`
            No hay ningún ramo registrado para este grupo.

            Usa /addramo para añadir uno.
            `));
            return;
        }

        const subjectStrings = subjects.result.sort(alphabetically('name'))
            .map(s => `[${s.code}] ${s.name} (${s.credits} créditos)`);
        const selectionMenu = createSelectionMenu(subjectStrings);

        this.subjects.set(context.session, subjects.result);
        this.client.activeMenus.set(context.session, this.name);

        await context.fancyReply('Elige el ramo a eliminar desde el menú.', {
            'reply_markup': selectionMenu,
        });
    }

    private async deleteSubject(context: CommandContext, subjects: SubjectObject[]): Promise<void> {
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
            })
        );
        if (!deleted.ok) {
            this.client.activeMenus.delete(context.session);
            await this.client.catchError(deleted.error, context, removeKeyboard);
            return;
        }

        this.client.activeMenus.delete(context.session);
        await context.fancyReply(stripIndent(`
        Removido el siguiente ramo:

        *Nombre*: ${subject.name}
        *Código*: ${code}
        *Créditos*: ${subject.credits}
        `), {
            'parse_mode': 'MarkdownV2',
            ...removeKeyboard,
        });
    }
}

function createSelectionMenu(subjects: string[]): ReplyKeyboardMarkup {
    return Markup
        .keyboard(subjects, {
            columns: 1,
        })
        .oneTime()
        .resize()
        .selective()
        .reply_markup;
}
