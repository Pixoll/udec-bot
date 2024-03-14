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
import { Page } from 'puppeteer';
import { getTabWithUrl, openTab } from '../puppeteer';

const menuUrl = 'https://dise.udec.cl/node/171';
let menuTab: Page | undefined;

const querySelectors = {
    menu: '#node-171 > div > div > div > table > tbody',
    selectDay: 'form#form1 > select#dia',
    selectMonth: 'form#form1 > select#mes',
    viewMenuAtDate: 'form#form1 > input',
} as const;

const menusCache: Record<string, string> = {};

const args = [{
    key: 'fecha',
    prompt: 'La fecha del menú a buscar.',
    type: ArgumentType.Date,
}] as const satisfies ArgumentOptions[];

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

    public async run(context: CommandContext, { fecha }: ArgsResult): Promise<void> {
        const menu = await getJunaebMenu(fecha);
        await context.fancyReply(menu, {
            'parse_mode': 'MarkdownV2',
        });
    }
}

async function getJunaebMenu(date: Date | null): Promise<string> {
    const dateString = dateToString(date);
    if (menusCache[dateString]) return menusCache[dateString];

    menuTab ??= await getMenuTab();
    if (date) {
        const [day, month] = dateString.split('/').slice(0, 2).map(n => +n);
        await getMenuAtDate(menuTab, day, month);
    }

    const menuTable = await menuTab.waitForSelector(querySelectors.menu).catch(() => null);
    if (!menuTable) return 'No se pudo encontrar el menú Junaeb.';

    const parsedMenu = await menuTable.evaluate(menu =>
        [...menu.children].map(child => child.textContent?.trim().replace(/\s+/g, ' ') ?? '')
    );
    const mainMenu = parsedMenu.slice(1, parsedMenu.indexOf(''))
        .flatMap(menu => {
            menu = menu.replace(/\s*:\s*/, ': ');
            const name = menu.slice(0, menu.indexOf(':'));
            const dish = menu.slice(menu.indexOf(':') + 2).replace(/-/g, '\\-');
            return [`\\- *${name}*:`, `_${dish}_`, ''];
        });

    const menuString = [
        '🦆 *Menu Los Patos* 🦆',
        `\\~ _${dateString}_`,
        '',
        ...mainMenu,
    ].join('\n');
    menusCache[dateString] = menuString;

    return menuString;
}

async function getMenuTab(): Promise<Page> {
    return await getTabWithUrl(menuUrl) ?? await openTab(menuUrl);
}

async function getMenuAtDate(tab: Page, day: number, month: number): Promise<boolean> {
    const daySelector = await tab.waitForSelector(querySelectors.selectDay).catch(() => null);
    if (!daySelector) return false;
    const monthSelector = await tab.waitForSelector(querySelectors.selectMonth).catch(() => null);
    if (!monthSelector) return false;
    const submitButton = await tab.waitForSelector(querySelectors.viewMenuAtDate).catch(() => null);
    if (!submitButton) return false;

    await daySelector.select(day.toString());
    await monthSelector.select(month.toString());
    await submitButton.click();
    const reloaded = await tab.waitForNavigation();

    return !!reloaded;
}
