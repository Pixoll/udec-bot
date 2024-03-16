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
    const [day, month] = dateString.split('/').slice(0, 2).map(n => +n);
    await getMenuAtDate(menuTab, day, month);
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