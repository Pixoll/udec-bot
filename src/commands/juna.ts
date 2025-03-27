import axios from "axios";
import parseHtml, { HTMLElement } from "node-html-parser";
import { URLSearchParams } from "url";
import { TelegramClientType } from "../client";
import {
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
    Command,
    CommandContext,
    dateToString,
    escapeMarkdown,
    TelegramClient,
} from "../lib";
import { stripIndent } from "../util";

const menuErrorList = "alert alert-block alert-danger alert-dismissible error messages";

const menuUrl = "https://dise.udec.cl/node/171";
const querySelectors = {
    menuId: "node-171",
    menuTable: "div > div > div > table",
    error: "div > section > div",
} as const;

const menusCache: Record<string, string> = {};

const args = [{
    key: "date",
    label: "fecha",
    type: ArgumentType.Date,
    examples: ["/juna DD-MM", "/juna 03-05"],
} as const satisfies ArgumentOptions<ArgumentType.Date>] as const;

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

// noinspection JSUnusedGlobalSymbols
export default class JunaCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: "juna",
            description: "Menu de Casino Los Patos.",
            args,
        });
    }

    public async run(context: CommandContext, { date }: ArgsResult): Promise<void> {
        const dateString = dateToString(date);
        const cached = menusCache[dateString];
        if (cached) {
            await context.fancyReply(cached, {
                parse_mode: "MarkdownV2",
            });
            return;
        }

        const [day = 1, month = 1] = dateString.split("/").slice(0, 2).map(n => +n);
        const menuTable = await getMenuAtDate(day, month);
        if (!menuTable) {
            const day = date ? "ese día" : "hoy";
            await context.fancyReply(`No se pudo encontrar el menú Junaeb. Puede que no estén sirviendo ${day}.`);
            return;
        }

        const menu = stripIndent(`
        🦆 *Menu Los Patos* 🦆
        \\~ _${dateString}_

        ${parseMenu(menuTable)}
        `);

        menusCache[dateString] = menu;
        await context.fancyReply(menu, {
            parse_mode: "MarkdownV2",
        });
    }
}

function parseMenu(menuTable: HTMLElement): string {
    const menuStrings = [...menuTable.childNodes]
        .filter(n => n.nodeType === 1)
        .map(c => c.innerText?.trim().replace(/\s+/g, " "));

    return stripIndent(`
    ${menuToString(menuStrings.slice(1, 6))}
    
    ${menuToString(menuStrings.slice(8))}
    `);
}

function menuToString(menuStrings: string[]): string {
    return menuStrings
        .flatMap((menu: string) => {
            menu = menu.replace(/\s*:\s*/, ": ");
            const name = menu.slice(0, menu.indexOf(":"));
            const dish = menu.slice(menu.indexOf(":") + 2);
            return [`\\- *${name}*:`, `_${escapeMarkdown(dish)}_`, ""];
        })
        .join("\n")
        .trimEnd();
}

async function getMenuAtDate(day: number, month: number): Promise<HTMLElement | null> {
    const response = await axios.post(menuUrl, new URLSearchParams({
        dia: day.toString(),
        mes: month.toString(),
        Submit: "Ver Menú",
    }).toString());
    if (response.status < 200 || response.status >= 300) return null;

    const html = parseHtml(response.data);
    const error = html.querySelectorAll(querySelectors.error).find(div =>
        div.classList.value.sort().join(" ") === menuErrorList
    );
    if (error) return null;

    const table = html.getElementById(querySelectors.menuId)?.querySelector(querySelectors.menuTable);
    return table ?? null;
}
