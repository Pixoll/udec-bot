"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const puppeteer_1 = require("../puppeteer");
const util_1 = require("../util");
const tables_1 = require("../tables");
const subjectInfoBaseUrl = 'https://alumnos.udec.cl/?q=node/25&codasignatura=';
let subjectInfoTab;
const querySelectors = {
    name: '#node-25 > div > div > div > div:nth-child(1)',
    listWithCredits: '#node-25 > div > div > div > ul',
};
const romanNumeralsRegex = ['I', 'II', 'III', 'IV', 'V']
    .map(n => new RegExp(`^${n}$`));
const args = [{
        key: 'code',
        label: 'código',
        description: 'Código del ramo.',
        type: lib_1.ArgumentType.Number,
        min: 0,
        required: true,
    }];
class AddRamoCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'addramo',
            description: 'Añade un ramo al grupo.',
            groupOnly: true,
            args,
        });
    }
    async run(context, { code }) {
        const chatId = context.chat.id;
        const existing = await this.client.db.select('udec_subjects', builder => builder
            .where({
            column: 'code',
            equals: code,
        })
            .where({
            column: 'chat_id',
            equals: chatId,
        })).then(q => q.ok ? q.result[0] ?? null : null);
        if (existing) {
            await context.fancyReply((0, util_1.stripIndent)(`
            Este ramo ya está registrado con los siguientes datos:

            *Nombre*: ${existing.name}
            *Código*: ${code}
            *Créditos*: ${existing.credits}
            `), {
                'parse_mode': 'MarkdownV2',
            });
            return;
        }
        const tab = await loadSubjectInfoTab(code);
        const name = await getSubjectName(tab, code);
        if (!name) {
            await context.fancyReply(`No se pudo encontrar el ramo con código ${code}.`);
            return;
        }
        const credits = await getSubjectCredits(tab);
        if (!credits) {
            await context.fancyReply('No se pudo encontrar los créditos del ramo.');
            return;
        }
        const inserted = await this.client.db.insert('udec_subjects', builder => builder.values({
            code,
            credits,
            name,
            'chat_id': chatId,
        }));
        if (!inserted.ok) {
            await context.fancyReply('Hubo un error al añadir el ramo.');
            await this.client.catchError(inserted.error, context);
            return;
        }
        await context.fancyReply((0, util_1.stripIndent)(`
        ¡Ramo registrado\\! 🎉

        *Nombre*: ${name}
        *Código*: ${code}
        *Créditos*: ${credits}
        `), {
            'parse_mode': 'MarkdownV2',
        });
        await this.client.db.insert('udec_actions_history', builder => builder.values({
            'chat_id': chatId,
            username: context.from.full_username,
            type: tables_1.ActionType.AddSubject,
            timestamp: new Date(),
        }));
    }
}
exports.default = AddRamoCommand;
async function getSubjectName(tab, code) {
    const nameElement = await tab.waitForSelector(querySelectors.name, {
        timeout: 2_000,
    }).catch(() => null);
    if (!nameElement)
        return null;
    const name = await nameElement.evaluate((div, c) => {
        const text = div.textContent;
        const codeRegex = new RegExp(` - ${c}$`);
        return text.replace(codeRegex, '');
    }, code);
    return parseSubjectName(name);
}
function parseSubjectName(name) {
    return name.replace(/\?/g, 'Ñ').trim().split(/\s+/)
        .map(w => {
        const isNumeral = romanNumeralsRegex.some(r => r.test(w.replace(/[^\w]+/g, '')));
        if (w === 'PARA' || (w.length <= 3 && !isNumeral)) {
            return w.toLowerCase();
        }
        const restLower = w.length > 3 && !isNumeral;
        return (0, lib_1.capitalize)(w, restLower);
    })
        .join(' ');
}
async function getSubjectCredits(tab) {
    const listWithCredits = await tab.waitForSelector(querySelectors.listWithCredits, {
        timeout: 2_000,
    }).catch(() => null);
    if (!listWithCredits)
        return null;
    const credits = await listWithCredits.evaluate(ul => {
        const creditsElement = [...ul.children].find((li) => {
            const text = li.textContent.toLowerCase();
            return /^cr[eé]dito/.test(text);
        });
        const credits = creditsElement?.innerText.trim().match(/\d+$/)?.[0];
        return credits ? +credits : null;
    });
    return credits;
}
async function loadSubjectInfoTab(code) {
    subjectInfoTab ??= await (0, puppeteer_1.getTabWithUrl)(subjectInfoBaseUrl) ?? await (0, puppeteer_1.openTab)(subjectInfoBaseUrl + code);
    if (!subjectInfoTab.url().endsWith(code.toString())) {
        await subjectInfoTab.goto(subjectInfoBaseUrl + code);
    }
    return subjectInfoTab;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsZ0NBUWdCO0FBQ2hCLDRDQUFzRDtBQUN0RCxrQ0FBc0M7QUFDdEMsc0NBQXVDO0FBRXZDLE1BQU0sa0JBQWtCLEdBQUcsbURBQW1ELENBQUM7QUFDL0UsSUFBSSxjQUFnQyxDQUFDO0FBQ3JDLE1BQU0sY0FBYyxHQUFHO0lBQ25CLElBQUksRUFBRSwrQ0FBK0M7SUFDckQsZUFBZSxFQUFFLGlDQUFpQztDQUM1QyxDQUFDO0FBRVgsTUFBTSxrQkFBa0IsR0FBc0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO0tBQ3RFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRXBDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLEtBQUssRUFBRSxRQUFRO1FBQ2YsV0FBVyxFQUFFLGtCQUFrQjtRQUMvQixJQUFJLEVBQUUsa0JBQVksQ0FBQyxNQUFNO1FBQ3pCLEdBQUcsRUFBRSxDQUFDO1FBQ04sUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBc0MsQ0FBQztBQUt4QyxNQUFxQixjQUFlLFNBQVEsYUFBZ0I7SUFJeEQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsV0FBVyxFQUFFLHlCQUF5QjtZQUN0QyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFjO1FBQzFELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENB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