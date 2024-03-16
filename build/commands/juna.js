"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const puppeteer_1 = require("../puppeteer");
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
        const menu = await getJunaebMenu(date);
        await context.fancyReply(menu, {
            'parse_mode': 'MarkdownV2',
        });
    }
}
exports.default = TestCommand;
async function getJunaebMenu(date) {
    const dateString = (0, lib_1.dateToString)(date);
    if (menusCache[dateString])
        return menusCache[dateString];
    menuTab ??= await getMenuTab();
    if (date) {
        const [day, month] = dateString.split('/').slice(0, 2).map(n => +n);
        await getMenuAtDate(menuTab, day, month);
    }
    const error = await menuTab.waitForSelector(querySelectors.error, { timeout: 2_000 }).catch(() => null);
    if (error)
        return 'No se pudo encontrar el menú Junaeb\\.';
    const menuTable = await menuTab.waitForSelector(querySelectors.menu).catch(() => null);
    if (!menuTable)
        return 'No se pudo encontrar el menú Junaeb\\.';
    const parsedMenu = await menuTable.evaluate(menu => [...menu.children].map(child => child.textContent?.trim().replace(/\s+/g, ' ') ?? ''));
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
async function getMenuTab() {
    return await (0, puppeteer_1.getTabWithUrl)(menuUrl) ?? await (0, puppeteer_1.openTab)(menuUrl);
}
async function getMenuAtDate(tab, day, month) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9qdW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0NBUWdCO0FBRWhCLDRDQUFzRDtBQUV0RCxNQUFNLE9BQU8sR0FBRywrQkFBK0IsQ0FBQztBQUNoRCxJQUFJLE9BQXlCLENBQUM7QUFFOUIsTUFBTSxjQUFjLEdBQUc7SUFDbkIsS0FBSyxFQUFFLHFGQUFxRjtJQUM1RixJQUFJLEVBQUUsNkNBQTZDO0lBQ25ELFNBQVMsRUFBRSx5QkFBeUI7SUFDcEMsV0FBVyxFQUFFLHlCQUF5QjtJQUN0QyxjQUFjLEVBQUUsb0JBQW9CO0NBQzlCLENBQUM7QUFFWCxNQUFNLFVBQVUsR0FBMkIsRUFBRSxDQUFDO0FBRTlDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLEtBQUssRUFBRSxPQUFPO1FBQ2QsTUFBTSxFQUFFLDZCQUE2QjtRQUNyQyxJQUFJLEVBQUUsa0JBQVksQ0FBQyxJQUFJO0tBQzFCLENBQXNDLENBQUM7QUFLeEMsTUFBcUIsV0FBWSxTQUFRLGFBQWdCO0lBSXJELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLFdBQVcsRUFBRSwyQkFBMkI7WUFDeEMsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDMUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtZQUMzQixZQUFZLEVBQUUsWUFBWTtTQUM3QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFsQkQsOEJBa0JDO0FBRUQsS0FBSyxVQUFVLGFBQWEsQ0FBQyxJQUFpQjtJQUMx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