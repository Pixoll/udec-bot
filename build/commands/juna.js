"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const puppeteer_1 = require("../puppeteer");
const util_1 = require("../util");
const menuUrl = 'https://dise.udec.cl/node/171';
let menuTab;
const querySelectors = {
    error: 'div > section > div.alert.alert-block.alert-dismissible.alert-danger.messages.error',
    menu: '#node-171 > div > div > div > table > tbody',
    selectDay: 'form#form1 > select#dia',
    selectMonth: 'form#form1 > select#mes',
    viewMenuAtDate: 'form#form1 > input',
};
const menusCache = {};
const args = [{
        key: 'date',
        label: 'fecha',
        prompt: 'La fecha del menú a buscar.',
        type: lib_1.ArgumentType.Date,
    }];
class TestCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'juna',
            description: 'Menu de Casino Los Patos.',
            args,
        });
    }
    async run(context, { date }) {
        const dateString = (0, lib_1.dateToString)(date);
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
            await context.fancyReply('No se pudo encontrar el menú Junaeb.');
            return;
        }
        const menuTable = await getMenuTable(menuTab);
        if (!menuTable) {
            await context.fancyReply('No se pudo encontrar el menú Junaeb.');
            return;
        }
        const menu = (0, util_1.stripIndent)(`
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
exports.default = TestCommand;
async function getMenuTable(tab) {
    const error = await tab.waitForSelector(querySelectors.error, { timeout: 2_000 }).catch(() => null);
    if (error)
        return null;
    const menuTable = await tab.waitForSelector(querySelectors.menu).catch(() => null);
    return menuTable;
}
async function parseMenu(menuTable) {
    const parsedMenu = await menuTable.evaluate(menu => [...menu.children].map(child => child.textContent?.trim().replace(/\s+/g, ' ') ?? ''));
    const menu = parsedMenu.slice(1, parsedMenu.indexOf(''))
        .flatMap(menu => {
        menu = menu.replace(/\s*:\s*/, ': ');
        const name = menu.slice(0, menu.indexOf(':'));
        const dish = menu.slice(menu.indexOf(':') + 2).replace(/-/g, '\\-');
        return [`\\- *${name}*:`, `_${dish}_`, ''];
    });
    return menu.join('\n');
}
async function getMenuTab() {
    return await (0, puppeteer_1.getTabWithUrl)(menuUrl) ?? await (0, puppeteer_1.openTab)(menuUrl);
}
async function loadMenuAtDate(tab, day, month) {
    const daySelector = await tab.waitForSelector(querySelectors.selectDay).catch(() => null);
    if (!daySelector)
        return false;
    const monthSelector = await tab.waitForSelector(querySelectors.selectMonth).catch(() => null);
    if (!monthSelector)
        return false;
    const submitButton = await tab.waitForSelector(querySelectors.viewMenuAtDate).catch(() => null);
    if (!submitButton)
        return false;
    await daySelector.select(day.toString());
    await monthSelector.select(month.toString());
    await submitButton.click();
    const reloaded = await tab.waitForNavigation();
    return !!reloaded;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9qdW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0NBUWdCO0FBRWhCLDRDQUFzRDtBQUN0RCxrQ0FBc0M7QUFFdEMsTUFBTSxPQUFPLEdBQUcsK0JBQStCLENBQUM7QUFDaEQsSUFBSSxPQUF5QixDQUFDO0FBRTlCLE1BQU0sY0FBYyxHQUFHO0lBQ25CLEtBQUssRUFBRSxxRkFBcUY7SUFDNUYsSUFBSSxFQUFFLDZDQUE2QztJQUNuRCxTQUFTLEVBQUUseUJBQXlCO0lBQ3BDLFdBQVcsRUFBRSx5QkFBeUI7SUFDdEMsY0FBYyxFQUFFLG9CQUFvQjtDQUM5QixDQUFDO0FBRVgsTUFBTSxVQUFVLEdBQTJCLEVBQUUsQ0FBQztBQUU5QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsT0FBTztRQUNkLE1BQU0sRUFBRSw2QkFBNkI7UUFDckMsSUFBSSxFQUFFLGtCQUFZLENBQUMsSUFBSTtLQUMxQixDQUFzQyxDQUFDO0FBS3hDLE1BQXFCLFdBQVksU0FBUSxhQUFnQjtJQUlyRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixXQUFXLEVBQUUsMkJBQTJCO1lBQ3hDLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFjO1FBQzFELE1BQU0sVUFBVSxHQUFHLElBQUEsa0JBQVksRUFBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7Z0JBQzdCLFlBQVksRUFB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