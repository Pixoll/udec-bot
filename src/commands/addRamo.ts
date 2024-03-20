import axios from 'axios';
import parseHtml from 'node-html-parser';
import { TelegramClientType } from '../client';
import {
    Argument,
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
    Command,
    CommandContext,
    TelegramClient,
    capitalize,
    escapeMarkdown,
} from '../lib';
import { ActionType } from '../tables';
import { stripIndent } from '../util';

const subjectInfoBaseUrl = 'https://alumnos.udec.cl/?q=node/25&codasignatura=';
const querySelectors = {
    infoId: 'node-25',
    name: 'div > div > div > div',
    listWithCredits: 'div > div > div > ul',
} as const;

const romanNumeralsRegex: readonly RegExp[] = ['I', 'II', 'III', 'IV', 'V']
    .map(n => new RegExp(`^${n}$`));

const args = [{
    key: 'code',
    label: 'código',
    prompt: escapeMarkdown('Ingrese el código del ramo.\n\nEjemplo: `/addramo 123456`.', '`'),
    type: ArgumentType.Number,
    min: 0,
    required: true,
    // @ts-expect-error: makes no difference
    validate(value, context, argument: Argument) {
        if (value.length !== 6) {
            return 'El código debe tener 6 dígitos.\n\nEjemplo: `/addramo 123456`.';
        }
        return argument.typeHandler.validate(value, context, argument);
    },
} as const satisfies ArgumentOptions<ArgumentType.Number>] as const;

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

interface SubjectInfo {
    readonly name: string;
    readonly credits: number;
}

export default class AddRamoCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'addramo',
            description: 'Añade un ramo al grupo.',
            groupOnly: true,
            args,
        });
    }

    public async run(context: CommandContext, { code }: ArgsResult): Promise<void> {
        const chatId = context.chat.id;

        const existing = await this.client.db.select('udec_subjects', builder => builder
            .where({
                column: 'code',
                equals: code,
            })
            .where({
                column: 'chat_id',
                equals: chatId,
            })
        ).then(q => q.ok ? q.result[0] ?? null : null);
        if (existing) {
            await context.fancyReply(stripIndent(`
            Este ramo ya está registrado con los siguientes datos:

            *Nombre*: ${existing.name}
            *Código*: ${code}
            *Créditos*: ${existing.credits}
            `), {
                'parse_mode': 'MarkdownV2',
            });
            return;
        }

        const subjectInfo = await getSubjectInfo(code);
        if (!subjectInfo) {
            await context.fancyReply('No se pudo encontrar información sobre el ramo.');
            return;
        }

        const inserted = await this.client.db.insert('udec_subjects', builder => builder.values({
            code,
            ...subjectInfo,
            'chat_id': chatId,
        }));
        if (!inserted.ok) {
            await context.fancyReply('Hubo un error al añadir el ramo.');
            await this.client.catchError(inserted.error, context);
            return;
        }

        await context.fancyReply(stripIndent(`
        ¡Ramo registrado\\! 🎉

        *Nombre*: ${subjectInfo.name}
        *Código*: ${code}
        *Créditos*: ${subjectInfo.credits}
        `), {
            'parse_mode': 'MarkdownV2',
        });

        await this.client.db.insert('udec_actions_history', builder => builder.values({
            'chat_id': chatId,
            username: context.from.full_username,
            type: ActionType.AddSubject,
            timestamp: new Date(),
        }));
    }
}

async function getSubjectInfo(code: number): Promise<SubjectInfo | null> {
    const response = await axios.get(subjectInfoBaseUrl + code);
    if (response.status < 200 || response.status >= 300) return null;

    const html = parseHtml(response.data);
    const infoSection = html.getElementById(querySelectors.infoId);
    if (!infoSection) return null;

    const name = infoSection.querySelector(querySelectors.name)?.innerText
        .replace(new RegExp(` - ${code}$`), '');
    if (!name) return null;

    const credits = [...(infoSection.querySelector(querySelectors.listWithCredits)?.childNodes ?? [])]
        .find(li => /^cr[eé]dito/.test(li.innerText.toLowerCase()))?.innerText
        .trim()
        .match(/\d+$/)?.[0];
    if (!credits) return null;

    return {
        name: parseSubjectName(name),
        credits: +credits,
    };
}

function parseSubjectName(name: string): string {
    return name.replace(/\?/g, 'Ñ').trim().split(/\s+/)
        .map(w => {
            const isNumeral = romanNumeralsRegex.some(r => r.test(w.replace(/[^\w]+/g, '')));
            if (w === 'PARA' || (w.length <= 3 && !isNumeral)) {
                return w.toLowerCase();
            }

            const restLower = w.length > 3 && !isNumeral;
            return capitalize(w, restLower);
        })
        .join(' ');
}
