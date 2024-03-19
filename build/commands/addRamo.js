"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const puppeteer_1 = require("../puppeteer");
const util_1 = require("../util");
const tables_1 = require("../tables");
const subjectInfoBaseUrl = 'https://alumnos.udec.cl/?q=node/25&codasignatura=';
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
        const tab = await (0, puppeteer_1.openTab)(subjectInfoBaseUrl + code);
        const name = await getSubjectName(tab, code);
        if (!name) {
            await context.fancyReply(`No se pudo encontrar el ramo con código ${code}.`);
            await tab.close();
            return;
        }
        const credits = await getSubjectCredits(tab);
        if (!credits) {
            await context.fancyReply('No se pudo encontrar los créditos del ramo.');
            await tab.close();
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
            await tab.close();
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
        await tab.close();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsZ0NBUWdCO0FBQ2hCLDRDQUF1QztBQUN2QyxrQ0FBc0M7QUFDdEMsc0NBQXVDO0FBRXZDLE1BQU0sa0JBQWtCLEdBQUcsbURBQW1ELENBQUM7QUFDL0UsTUFBTSxjQUFjLEdBQUc7SUFDbkIsSUFBSSxFQUFFLCtDQUErQztJQUNyRCxlQUFlLEVBQUUsaUNBQWlDO0NBQzVDLENBQUM7QUFFWCxNQUFNLGtCQUFrQixHQUFzQixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7S0FDdEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFcEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLFFBQVE7UUFDZixXQUFXLEVBQUUsa0JBQWtCO1FBQy9CLElBQUksRUFBRSxrQkFBWSxDQUFDLE1BQU07UUFDekIsR0FBRyxFQUFFLENBQUM7UUFDTixRQUFRLEVBQUUsSUFBSTtLQUN1QyxDQUFVLENBQUM7QUFLcEUsTUFBcUIsY0FBZSxTQUFRLGFBQWdCO0lBSXhELFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsU0FBUztZQUNmLFdBQVcsRUFBRSx5QkFBeUI7WUFDdEMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1NBQ1AsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLElBQUksRUFBYztRQUMxRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUUvQixNQUFN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