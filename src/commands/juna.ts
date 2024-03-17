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
import { ElementHandle, Page } from 'puppeteer';
import { getTabWithUrl, openTab } from '../puppeteer';
import { stripIndent } from '../util';

const menuUrl = 'https://dise.udec.cl/node/171';
let menuTab: Page | undefined;

const querySelectors = {
    error: 'div > section > div.alert.alert-block.alert-dismissible.alert-danger.messages.error',
    menu: '#node-171 > div > div > div > table > tbody',
    selectDay: 'form#form1 > select#dia',
    selectMonth: 'form#form1 > select#mes',
    viewMenuAtDate: 'form#form1 > input',
} as const;

const menusCache: Record<string, string> = {};

const args = [{
    key: 'date',
    label: 'fecha',
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

    public async run(context: CommandContext, { date }: ArgsResult): Promise<void> {
        const dateString = dateToString(date);
        const cached = menusCache[dateString];
        if (cached) {
            await context.fancyReply(cached, {
                'parse_mode': 'MarkdownV2',
            });
            return;
        }

        menuTab ??= await getMenuTab();
        const [day, month] = dateString.split('/').slice(0, 2).map(n => +n);
        const loaded = await loadMenuAtDate(menuTab, day, month);
        if (!loaded) {
            await context.fancyReply('No se pudo encontrar el menú Junaeb. Puede es que hoy no estén sirviendo.');
            return;
        }

        const menuTable = await getMenuTable(menuTab);
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

async function getMenuTable(tab: Page): Promise<ElementHandle<HTMLTableSectionElement> | null> {
    const error = await tab.waitForSelector(querySelectors.error, { timeout: 2_000 }).catch(() => null);
    if (error) return null;

    const menuTable = await tab.waitForSelector(querySelectors.menu).catch(() => null);
    return menuTable;
}

async function parseMenu(menuTable: ElementHandle<HTMLTableSectionElement>): Promise<string> {
    const parsedMenu = await menuTable.evaluate(menu =>
        [...menu.children].map(child => child.textContent?.trim().replace(/\s+/g, ' ') ?? '')
    );
    const menu = parsedMenu.slice(1, parsedMenu.indexOf(''))
        .flatMap(menu => {
            menu = menu.replace(/\s*:\s*/, ': ');
            const name = menu.slice(0, menu.indexOf(':'));
            const dish = menu.slice(menu.indexOf(':') + 2).replace(/-/g, '\\-');
            return [`\\- *${name}*:`, `_${dish}_`, ''];
        });
    return menu.join('\n');
}

async function getMenuTab(): Promise<Page> {
    return await getTabWithUrl(menuUrl) ?? await openTab(menuUrl);
}

async function loadMenuAtDate(tab: Page, day: number, month: number): Promise<boolean> {
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
