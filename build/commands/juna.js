"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const node_html_parser_1 = __importDefault(require("node-html-parser"));
const lib_1 = require("../lib");
const util_1 = require("../util");
const url_1 = require("url");
const menuErrorList = 'alert alert-block alert-danger alert-dismissible error messages';
const menuUrl = 'https://dise.udec.cl/node/171';
const querySelectors = {
    menuId: 'node-171',
    menuTable: 'div > div > div > table',
    error: 'div > section > div',
};
const menusCache = {};
const args = [{
        key: 'date',
        label: 'fecha',
        type: lib_1.ArgumentType.Date,
        whenInvalid: (0, lib_1.escapeMarkdown)('Formato de fecha inválido. Debe ser DD-MM o DD-MM-YYYY.\n\nEjemplo: `/juna DD-MM`.', '`'),
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
        const [day, month] = dateString.split('/').slice(0, 2).map(n => +n);
        const menuTable = await getMenuAtDate(day, month);
        if (!menuTable) {
            const day = date ? 'ese día' : 'hoy';
            await context.fancyReply(`No se pudo encontrar el menú Junaeb. Puede que no estén sirviendo ${day}.`);
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
async function parseMenu(menuTable) {
    return [...menuTable.childNodes]
        .filter(n => n.nodeType === 1)
        .map(c => c.innerText?.trim().replace(/\s+/g, ' '))
        .slice(1, 6)
        .flatMap(menu => {
        menu = menu.replace(/\s*:\s*/, ': ');
        const name = menu.slice(0, menu.indexOf(':'));
        const dish = menu.slice(menu.indexOf(':') + 2);
        return [`\\- *${name}*:`, `_${(0, lib_1.escapeMarkdown)(dish)}_`, ''];
    })
        .join('\n')
        .trimEnd();
}
async function getMenuAtDate(day, month) {
    const response = await axios_1.default.post(menuUrl, new url_1.URLSearchParams({
        dia: day.toString(),
        mes: month.toString(),
        Submit: 'Ver Menú',
    }).toString());
    if (response.status < 200 || response.status >= 300)
        return null;
    const html = (0, node_html_parser_1.default)(response.data);
    const error = html.querySelectorAll(querySelectors.error).find(div => div.classList.value.sort().join(' ') === menuErrorList);
    if (error)
        return null;
    const table = html.getElementById(querySelectors.menuId)?.querySelector(querySelectors.menuTable);
    return table ?? null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9qdW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLHdFQUEwRDtBQUUxRCxnQ0FTZ0I7QUFDaEIsa0NBQXNDO0FBQ3RDLDZCQUFzQztBQUV0QyxNQUFNLGFBQWEsR0FBRyxpRUFBaUUsQ0FBQztBQUV4RixNQUFNLE9BQU8sR0FBRywrQkFBK0IsQ0FBQztBQUNoRCxNQUFNLGNBQWMsR0FBRztJQUNuQixNQUFNLEVBQUUsVUFBVTtJQUNsQixTQUFTLEVBQUUseUJBQXlCO0lBQ3BDLEtBQUssRUFBRSxxQkFBcUI7Q0FDdEIsQ0FBQztBQUVYLE1BQU0sVUFBVSxHQUEyQixFQUFFLENBQUM7QUFFOUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLE9BQU87UUFDZCxJQUFJLEVBQUUsa0JBQVksQ0FBQyxJQUFJO1FBQ3ZCLFdBQVcsRUFBRSxJQUFBLG9CQUFjLEVBQUMsb0ZBQW9GLEVBQUUsR0FBRyxDQUFDO0tBQ25FLENBQVUsQ0FBQztBQUtsRSxNQUFxQixXQUFZLFNBQVEsYUFBZ0I7SUFJckQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osV0FBVyxFQUFFLDJCQUEyQjtZQUN4QyxJQUFJO1NBQ1AsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBYztRQUMxRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGtCQUFZLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDVCxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFB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