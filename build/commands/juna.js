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
const menuErrorList = "alert alert-block alert-danger alert-dismissible error messages";
const menuUrl = "https://dise.udec.cl/node/171";
const querySelectors = {
    menuId: "node-171",
    menuTable: "div > div > div > table",
    error: "div > section > div",
};
const menusCache = {};
const args = [{
        key: "date",
        label: "fecha",
        type: lib_1.ArgumentType.Date,
        examples: ["/juna DD-MM", "/juna 03-05"],
    }];
class TestCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: "juna",
            description: "Menu de Casino Los Patos.",
            args,
        });
    }
    async run(context, { date }) {
        const dateString = (0, lib_1.dateToString)(date);
        const cached = menusCache[dateString];
        if (cached) {
            await context.fancyReply(cached, {
                "parse_mode": "MarkdownV2",
            });
            return;
        }
        const [day, month] = dateString.split("/").slice(0, 2).map(n => +n);
        const menuTable = await getMenuAtDate(day, month);
        if (!menuTable) {
            const day = date ? "ese día" : "hoy";
            await context.fancyReply(`No se pudo encontrar el menú Junaeb. Puede que no estén sirviendo ${day}.`);
            return;
        }
        const menu = (0, util_1.stripIndent)(`
        🦆 *Menu Los Patos* 🦆
        \\~ _${dateString}_

        ${parseMenu(menuTable)}
        `);
        menusCache[dateString] = menu;
        await context.fancyReply(menu, {
            "parse_mode": "MarkdownV2",
        });
    }
}
exports.default = TestCommand;
function parseMenu(menuTable) {
    const menuStrings = [...menuTable.childNodes]
        .filter(n => n.nodeType === 1)
        .map(c => c.innerText?.trim().replace(/\s+/g, " "));
    return (0, util_1.stripIndent)(`
    ${menuToString(menuStrings.slice(1, 6))}
    
    ${menuToString(menuStrings.slice(8))}
    `);
}
function menuToString(menuStrings) {
    return menuStrings
        .flatMap((menu) => {
        menu = menu.replace(/\s*:\s*/, ": ");
        const name = menu.slice(0, menu.indexOf(":"));
        const dish = menu.slice(menu.indexOf(":") + 2);
        return [`\\- *${name}*:`, `_${(0, lib_1.escapeMarkdown)(dish)}_`, ""];
    })
        .join("\n")
        .trimEnd();
}
async function getMenuAtDate(day, month) {
    const response = await axios_1.default.post(menuUrl, new url_1.URLSearchParams({
        dia: day.toString(),
        mes: month.toString(),
        Submit: "Ver Menú",
    }).toString());
    if (response.status < 200 || response.status >= 300)
        return null;
    const html = (0, node_html_parser_1.default)(response.data);
    const error = html.querySelectorAll(querySelectors.error).find(div => div.classList.value.sort().join(" ") === menuErrorList);
    if (error)
        return null;
    const table = html.getElementById(querySelectors.menuId)?.querySelector(querySelectors.menuTable);
    return table ?? null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianVuYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9qdW5hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLHdFQUEwRDtBQUUxRCxnQ0FTZ0I7QUFDaEIsa0NBQXNDO0FBQ3RDLDZCQUFzQztBQUV0QyxNQUFNLGFBQWEsR0FBRyxpRUFBaUUsQ0FBQztBQUV4RixNQUFNLE9BQU8sR0FBRywrQkFBK0IsQ0FBQztBQUNoRCxNQUFNLGNBQWMsR0FBRztJQUNuQixNQUFNLEVBQUUsVUFBVTtJQUNsQixTQUFTLEVBQUUseUJBQXlCO0lBQ3BDLEtBQUssRUFBRSxxQkFBcUI7Q0FDdEIsQ0FBQztBQUVYLE1BQU0sVUFBVSxHQUEyQixFQUFFLENBQUM7QUFFOUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLE9BQU87UUFDZCxJQUFJLEVBQUUsa0JBQVksQ0FBQyxJQUFJO1FBQ3ZCLFFBQVEsRUFBRSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUM7S0FDVyxDQUFVLENBQUM7QUFNbEUsTUFBcUIsV0FBWSxTQUFRLGFBQWdCO0lBSXJELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsTUFBTTtZQUNaLFdBQVcsRUFBRSwyQkFBMkI7WUFDeEMsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDMUQsTUFBTSxVQUFVLEdBQUcsSUFBQSxrQkFBWSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDN0Is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