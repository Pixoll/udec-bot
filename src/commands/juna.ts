import axios from 'axios';
import { NodeType, parse as parseHtml } from 'node-html-parser';
import { TelegramClientType } from '../client';
import { Command, TelegramClient, CommandContext } from '../lib';

const menuUrl = 'https://dise.udec.cl/node/171';
const menusCache: Record<string, string> = {};

export default class TestCommand extends Command {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: 'juna',
            description: 'Menu de Casino Los Patos.',
        });
    }

    public async run(context: CommandContext): Promise<void> {
        const menu = await getJunaebMenu();
        await context.fancyReply(menu, {
            'parse_mode': 'MarkdownV2',
        });
    }
}

async function getJunaebMenu(): Promise<string> {
    const date = getDateNow();
    if (menusCache[date]) return menusCache[date];

    const response = await axios.get(menuUrl);
    const html = parseHtml(response.data);
    const menuTable = html.getElementById('node-171')?.childNodes
        .find(child => 'rawTagName' in child && child.rawTagName === 'div')
        ?.childNodes.filter(child => child.nodeType === NodeType.ELEMENT_NODE).at(0)
        ?.childNodes.filter(child => child.nodeType === NodeType.ELEMENT_NODE).at(0)
        ?.childNodes.filter(child => child.nodeType === NodeType.ELEMENT_NODE).at(0);
    if (!menuTable) return 'No se pudo encontrar el menú Junaeb.';

    const parsedMenu = menuTable.childNodes.filter(child => child.nodeType === NodeType.ELEMENT_NODE)
        .map(child => child.innerText.trim().replace(/\s+/g, ' '));
    const mainMenu = parsedMenu.slice(1, parsedMenu.indexOf(''))
        .flatMap(menu => {
            menu = menu.replace(/\s*:\s*/, ': ');
            const name = menu.slice(0, menu.indexOf(':'));
            const dish = menu.slice(menu.indexOf(':') + 2).replace(/-/g, '\\-');
            return [`\\- *${name}*:`, `_${dish}_`, ''];
        });

    const menuString = [
        '🦆 *Menu Los Patos* 🦆',
        `\\~ _${date}_`,
        '',
        ...mainMenu,
    ].join('\n');
    menusCache[date] = menuString;

    return menuString;
}

function getDateNow(): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Santiago',
    }).format(new Date());
}
