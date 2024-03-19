"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const puppeteer_1 = require("../puppeteer");
const util_1 = require("../util");
const menuUrl = 'https://dise.udec.cl/node/171';
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
        description: 'La fecha del menú a buscar.',
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
        const menuTab = await (0, puppeteer_1.openTab)(menuUrl);
        const [day, month] = dateString.split('/').slice(0, 2).map(n => +n);
        const loaded = await loadMenuAtDate(menuTab, day, month);
        if (!loaded) {
            await context.fancyReply('No se pudo encontrar el menú Junaeb. Puede es que hoy no estén sirviendo.');
            await menuTab.close();
            return;
        }
        const menuTable = await getMenuTable(menuTab);
        if (!menuTable) {
            await context.fancyReply('No se pudo encontrar el menú Junaeb. Puede que hoy no estén sirviendo.');
            await menuTab.close();
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
        await menuTab.close();
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
        const dish = menu.slice(menu.indexOf(':') + 2);
        return [`\\- *${name}*:`, `_${(0, util_1.escapeMarkdown)(dish)}_`, ''];
    });
    return menu.join('\n');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9qdW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0NBUWdCO0FBRWhCLDRDQUF1QztBQUN2QyxrQ0FBc0Q7QUFFdEQsTUFBTSxPQUFPLEdBQUcsK0JBQStCLENBQUM7QUFDaEQsTUFBTSxjQUFjLEdBQUc7SUFDbkIsS0FBSyxFQUFFLHFGQUFxRjtJQUM1RixJQUFJLEVBQUUsNkNBQTZDO0lBQ25ELFNBQVMsRUFBRSx5QkFBeUI7SUFDcEMsV0FBVyxFQUFFLHlCQUF5QjtJQUN0QyxjQUFjLEVBQUUsb0JBQW9CO0NBQzlCLENBQUM7QUFFWCxNQUFNLFVBQVUsR0FBMkIsRUFBRSxDQUFDO0FBRTlDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLEtBQUssRUFBRSxPQUFPO1FBQ2QsV0FBVyxFQUFFLDZCQUE2QjtRQUMxQyxJQUFJLEVBQUUsa0JBQVksQ0FBQyxJQUFJO0tBQzRCLENBQVUsQ0FBQztBQUtsRSxNQUFxQixXQUFZLFNBQVEsYUFBZ0I7SUFJckQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLDJCQUEyQjtZQUN4QyxJQUFJO1NBQ1AsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBYztRQUMxRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGtCQUFZLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDVCxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO2dCQUM3QixZQUFZLEVBQUUsWUFBWTthQUM3QixDQUFDLENBQUM7WUFDSCxPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSxtQkFBTyxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEUsTUFBTSxNQUFNLEdBQUcsTUFBTSxjQUFjLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDVixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsMkVBQTJFLENBQUMsQ0FBQztZQUN0RyxNQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN0QixPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNiLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyx3RUFBd0UsQ0FBQyxDQUFDO1lBQ25HLE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RCLE9BQU87UUFDWCxDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBQSxrQkFBVyxFQUFDOztlQUVsQixVQUFVOztVQUVmLE1BQU0sU0FBUyxDQUFDLFNBQVMsQ0FBQztTQUMzQixDQUFDLENBQUM7UUFFSCxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzlCLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUU7WUFDM0IsWUFBWSxFQUFFLFlBQVk7U0FDN0IsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBbkRELDhCQW1EQztBQUVELEtBQUssVUFBVSxZQUFZLENBQUMsR0FBUztJQUNqQyxNQUFNLEtBQUssR0FBRyxNQUFNLEdBQUcsQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwRyxJQUFJLEtBQUs7UUFBRSxPQUFPLElBQUksQ0FBQztJQUV2QixNQUFNLFNBQVMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRixPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBRUQsS0FBSyxVQUFVLFNBQVMsQ0FBQyxTQUFpRDtJQUN0RSxNQUFNLFVBQVUsR0FBRyxNQUFNLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FDL0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQ3hGLENBQUM7SUFDRixNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25ELE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNaLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDOUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFLElBQUksSUFBQSxxQkFBYyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQyxDQUFDLENBQUM7SUFDUCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUVELEtBQUssVUFBVSxjQUFjLENBQUMsR0FBUyxFQUFFLEdBQVcsRUFBRSxLQUFhO0lBQy9ELE1BQU0sV0FBVyxHQUFHLE1BQU0sR0FBRyxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFGLElBQUksQ0FBQyxXQUFXO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDL0IsTUFBTSxhQUFhLEdBQUcsTUFBTSxHQUFHLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUYsSUFBSSxDQUFDLGFBQWE7UUFBRSxPQUFPLEtBQUssQ0FBQztJQUNqQyxNQUFNLFlBQVksR0FBRyxNQUFNLEdBQUcsQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRyxJQUFJLENBQUMsWUFBWTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBRWhDLE1BQU0sV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN6QyxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDN0MsTUFBTSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUUvQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDdEIsQ0FBQyJ9