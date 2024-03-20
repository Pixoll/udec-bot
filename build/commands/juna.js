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
        examples: ['/addcert DD-MM', '/addcert 03-05'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9qdW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLHdFQUEwRDtBQUUxRCxnQ0FTZ0I7QUFDaEIsa0NBQXNDO0FBQ3RDLDZCQUFzQztBQUV0QyxNQUFNLGFBQWEsR0FBRyxpRUFBaUUsQ0FBQztBQUV4RixNQUFNLE9BQU8sR0FBRywrQkFBK0IsQ0FBQztBQUNoRCxNQUFNLGNBQWMsR0FBRztJQUNuQixNQUFNLEVBQUUsVUFBVTtJQUNsQixTQUFTLEVBQUUseUJBQXlCO0lBQ3BDLEtBQUssRUFBRSxxQkFBcUI7Q0FDdEIsQ0FBQztBQUVYLE1BQU0sVUFBVSxHQUEyQixFQUFFLENBQUM7QUFFOUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLE9BQU87UUFDZCxJQUFJLEVBQUUsa0JBQVksQ0FBQyxJQUFJO1FBQ3ZCLFFBQVEsRUFBRSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDO0tBQ0ssQ0FBVSxDQUFDO0FBS2xFLE1BQXFCLFdBQVksU0FBUSxhQUFnQjtJQUlyRCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixXQUFXLEVBQUUsMkJBQTJCO1lBQ3hDLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFjO1FBQzFELE1BQU0sVUFBVSxHQUFHLElBQUEsa0JBQVksRUFBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7Z0JB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