"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const node_html_parser_1 = require("node-html-parser");
const lib_1 = require("../lib");
const menuUrl = 'https://dise.udec.cl/node/171';
const menusCache = {};
class TestCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'juna',
            description: 'Menu de Casino Los Patos.',
        });
    }
    async run(context) {
        const menu = await getJunaebMenu();
        await context.fancyReply(menu, {
            'parse_mode': 'MarkdownV2',
        });
    }
}
exports.default = TestCommand;
async function getJunaebMenu() {
    const date = getDateNow();
    if (menusCache[date])
        return menusCache[date];
    const response = await axios_1.default.get(menuUrl);
    const html = (0, node_html_parser_1.parse)(response.data);
    const menuTable = html.getElementById('node-171')?.childNodes
        .find(child => 'rawTagName' in child && child.rawTagName === 'div')
        ?.childNodes.filter(child => child.nodeType === node_html_parser_1.NodeType.ELEMENT_NODE).at(0)
        ?.childNodes.filter(child => child.nodeType === node_html_parser_1.NodeType.ELEMENT_NODE).at(0)
        ?.childNodes.filter(child => child.nodeType === node_html_parser_1.NodeType.ELEMENT_NODE).at(0);
    if (!menuTable)
        return 'No se pudo encontrar el menú Junaeb.';
    const parsedMenu = menuTable.childNodes.filter(child => child.nodeType === node_html_parser_1.NodeType.ELEMENT_NODE)
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
function getDateNow() {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Santiago',
    }).format(new Date());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9qdW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLHVEQUFnRTtBQUVoRSxnQ0FBaUU7QUFFakUsTUFBTSxPQUFPLEdBQUcsK0JBQStCLENBQUM7QUFDaEQsTUFBTSxVQUFVLEdBQTJCLEVBQUUsQ0FBQztBQUU5QyxNQUFxQixXQUFZLFNBQVEsYUFBTztJQUk1QyxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixXQUFXLEVBQUUsMkJBQTJCO1NBQzNDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCO1FBQ3BDLE1BQU0sSUFBSSxHQUFHLE1BQU0sYUFBYSxFQUFFLENBQUM7UUFDbkMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtZQUMzQixZQUFZLEVBQUUsWUFBWTtTQUM3QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFqQkQsOEJBaUJDO0FBRUQsS0FBSyxVQUFVLGFBQWE7SUFDeEIsTUFBTSxJQUFJLEdBQUcsVUFBVSxFQUFFLENBQUM7SUFDMUIsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQUUsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFOUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFDLE1BQU0sSUFBSSxHQUFHLElBQUEsd0JBQVMsRUFBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxVQUFVO1NBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksSUFBSSxLQUFLLElBQUksS0FB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