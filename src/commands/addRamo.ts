import { Page } from 'puppeteer';
import { TelegramClientType } from '../client';
import {
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
    Command,
    CommandContext,
    TelegramClient,
    capitalize,
} from '../lib';
import { getTabWithUrl, openTab } from '../puppeteer';
import { stripIndent } from '../util';

const subjectInfoBaseUrl = 'https://alumnos.udec.cl/?q=node/25&codasignatura=';
let subjectInfoTab: Page | undefined;
const querySelectors = {
    name: '#node-25 > div > div > div > div:nth-child(1)',
    listWithCredits: '#node-25 > div > div > div > ul',
} as const;

const romanNumeralsRegex: readonly RegExp[] = ['I', 'II', 'III', 'IV', 'V']
    .map(n => new RegExp(`^${n}$`));

const args = [{
    key: 'code',
    label: 'código',
    prompt: 'Código del ramo.',
    type: ArgumentType.Number,
    min: 0,
    required: true,
}] as const satisfies ArgumentOptions[];

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

export default class AddRamoCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'addramo',
            description: 'Añadir un ramo.',
            groupOnly: true,
            args,
        });
    }

    public async run(context: CommandContext, { code }: ArgsResult): Promise<void> {
        const result = await this.client.db.select('udec_subjects', builder => builder.where({
            column: 'code',
            equals: code,
        })).then(r => r?.[0] ?? null);
        if (result) {
            await context.fancyReply(stripIndent(`
            Este ramo ya está registrado con los siguientes datos:

            *Nombre*: ${result.name}
            *Código*: ${code}
            *Créditos*: ${result.credits}
            `), {
                'parse_mode': 'MarkdownV2',
            });
            return;
        }

        const tab = await loadSubjectInfoTab(code);

        const name = await getSubjectName(tab, code);
        if (!name) {
            await context.fancyReply(`No se pudo encontrar el ramo con código ${code}.`);
            return;
        }

        const credits = await getSubjectCredits(tab);
        if (!credits) {
            await context.fancyReply('No se pudo encontrar los créditos del ramo.');
            return;
        }

        await this.client.db.insert('udec_subjects', builder => builder.values({
            code,
            credits,
            name,
        }));

        await context.fancyReply(stripIndent(`
        ¡Ramo registrado\\! 🎉

        *Nombre*: ${name}
        *Código*: ${code}
        *Créditos*: ${credits}
        `), {
            'parse_mode': 'MarkdownV2',
        });
    }
}

async function getSubjectName(tab: Page, code: number): Promise<string | null> {
    const nameElement = await tab.waitForSelector(querySelectors.name, {
        timeout: 2_000,
    }).catch(() => null);
    if (!nameElement) return null;

    const name = await nameElement.evaluate((div, c) => {
        const text = div.textContent as string;
        const codeRegex = new RegExp(` - ${c}$`);
        return text.replace(codeRegex, '');
    }, code);

    return parseSubjectName(name);
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

async function getSubjectCredits(tab: Page): Promise<number | null> {
    const listWithCredits = await tab.waitForSelector(querySelectors.listWithCredits, {
        timeout: 2_000,
    }).catch(() => null);
    if (!listWithCredits) return null;

    const credits = await listWithCredits.evaluate(ul => {
        const creditsElement = [...ul.children].find((li): li is HTMLLIElement => {
            const text = (li.textContent as string).toLowerCase();
            return /^cr[eé]dito/.test(text);
        });
        const credits = creditsElement?.innerText.trim().match(/\d+$/)?.[0];
        return credits ? +credits : null;
    });

    return credits;
}

async function loadSubjectInfoTab(code: number): Promise<Page> {
    subjectInfoTab ??= await getTabWithUrl(subjectInfoBaseUrl) ?? await openTab(subjectInfoBaseUrl + code);

    if (!subjectInfoTab.url().endsWith(code.toString())) {
        await subjectInfoTab.goto(subjectInfoBaseUrl + code);
    }

    return subjectInfoTab;
}
