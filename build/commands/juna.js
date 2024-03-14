"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const puppeteer_1 = require("../puppeteer");
const menuUrl = 'https://dise.udec.cl/node/171';
let menuTab;
const querySelectors = {
    menu: '#node-171 > div > div > div > table > tbody',
    selectDay: 'form#form1 > select#dia',
    selectMonth: 'form#form1 > select#mes',
    viewMenuAtDate: 'form#form1 > input',
};
const menusCache = {};
const args = [{
        key: 'fecha',
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
    async run(context, { fecha }) {
        const menu = await getJunaebMenu(fecha);
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
    const menuTable = await menuTab.waitForSelector(querySelectors.menu).catch(() => null);
    if (!menuTable)
        return 'No se pudo encontrar el menú Junaeb.';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9qdW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0NBUWdCO0FBRWhCLDRDQUFzRDtBQUV0RCxNQUFNLE9BQU8sR0FBRywrQkFBK0IsQ0FBQztBQUNoRCxJQUFJLE9BQXlCLENBQUM7QUFFOUIsTUFBTSxjQUFjLEdBQUc7SUFDbkIsSUFBSSxFQUFFLDZDQUE2QztJQUNuRCxTQUFTLEVBQUUseUJBQXlCO0lBQ3BDLFdBQVcsRUFBRSx5QkFBeUI7SUFDdEMsY0FBYyxFQUFFLG9CQUFvQjtDQUM5QixDQUFDO0FBRVgsTUFBTSxVQUFVLEdBQTJCLEVBQUUsQ0FBQztBQUU5QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLE9BQU87UUFDWixNQUFNLEVBQUUsNkJBQTZCO1FBQ3JDLElBQUksRUFBRSxrQkFBWSxDQUFDLElBQUk7S0FDMUIsQ0FBc0MsQ0FBQztBQUt4QyxNQUFxQixXQUFZLFNBQVEsYUFBZ0I7SUFJckQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLDJCQUEyQjtZQUN4QyxJQUFJO1NBQ1AsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLEtBQUssRUFBYztRQUMzRCxNQUFNLElBQUksR0FBRyxNQUFNLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQzNCLFlBQVksRUFBRSxZQUFZO1NBQzdCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWxCRCw4QkFrQkM7QUFFRCxLQUFLLFVBQVUsYUFBYSxDQUFDLElBQWlCO0lBQzFDLE1BQU0sVUFBVSxHQUFHLElBQUEsa0JBQVksRUFBQyxJQUFJLENBQUMs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