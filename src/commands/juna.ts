import axios from 'axios';
import parseHtml, { HTMLElement } from 'node-html-parser';
import { TelegramClientType } from '../client';
import {
    ArgumentOptions,
    ArgumentType,
    ArgumentOptionsToResult,
    Command,
    CommandContext,
    TelegramClient,
    dateToString,
} from '../lib';
import { escapeMarkdown, stripIndent } from '../util';
import { URLSearchParams } from 'url';

const menuErrorList = 'alert alert-block alert-danger alert-dismissible error messages';

const menuUrl = 'https://dise.udec.cl/node/171';
const querySelectors = {
    menuId: 'node-171',
    menuTable: 'div > div > div > table',
    error: 'div > section > div',
} as const;

const menusCache: Record<string, string> = {};

const args = [{
    key: 'date',
    label: 'fecha',
    description: 'La fecha del menú a buscar.',
    type: ArgumentType.Date,
} as const satisfies ArgumentOptions<ArgumentType.Date>] as const;

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

export default class TestCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'juna',
            description: 'Menu de Casino Los Patos.',
            args,
        });
    }

    public async run(context: CommandContext, { date }: ArgsResult): Promise<void> {
        const dateString = dateToString(date);
        const cached = menusCache[dateString];
        if (cached) {
            await context.fancyReply(cached, {
                'parse_mode': 'MarkdownV2',
            });
            return;
        }

        const [day, month] = dateString.split('/').slice(0, 2).map(n => +n);
        const menuTable = await getMenuAtDate(day, month);
        if (!menuTable) {
            await context.fancyReply('No se pudo encontrar el menú Junaeb. Puede que hoy no estén sirviendo.');
            return;
        }

        const menu = stripIndent(`
        🦆 *Menu Los Patos* 🦆
        \\~ _${dateString}_

        ${await parseMenu(menuTable)}
        `);

        menusCache[dateString] = menu;
        await context.fancyReply(menu, {
            'parse_mode': 'MarkdownV2',
        });
    }
}

async function parseMenu(menuTable: HTMLElement): Promise<string> {
    return [...menuTable.childNodes]
        .filter(n => n.nodeType === 1)
        .map(c => c.innerText?.trim().replace(/\s+/g, ' '))
        .slice(1, 6)
        .flatMap(menu => {
            menu = menu.replace(/\s*:\s*/, ': ');
            const name = menu.slice(0, menu.indexOf(':'));
            const dish = menu.slice(menu.indexOf(':') + 2);
            return [`\\- *${name}*:`, `_${escapeMarkdown(dish)}_`, ''];
        })
        .join('\n')
        .trimEnd();
}

async function getMenuAtDate(day: number, month: number): Promise<HTMLElement | null> {
    const response = await axios.post(menuUrl, new URLSearchParams({
        dia: day.toString(),
        mes: month.toString(),
        Submit: 'Ver Menú',
    }).toString());

    const html = parseHtml(response.data);
    const error = html.querySelectorAll(querySelectors.error).find(div =>
        div.classList.value.sort().join(' ') === menuErrorList
    );
    if (error) return null;

    const table = html.getElementById(querySelectors.menuId)?.querySelector(querySelectors.menuTable);
    return table ?? null;
}
