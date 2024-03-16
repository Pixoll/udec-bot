"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const puppeteer_1 = require("../puppeteer");
const util_1 = require("../util");
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
        prompt: 'Código del ramo.',
        type: lib_1.ArgumentType.Number,
        min: 0,
        required: true,
    }];
class AddRamoCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: 'addramo',
            description: 'Añadir un ramo.',
            groupOnly: true,
            args,
        });
    }
    async run(context, { code }) {
        const result = await this.client.db.select('udec_subjects', builder => builder.where({
            column: 'code',
            equals: code,
        })).then(r => r?.[0] ?? null);
        if (result) {
            await context.fancyReply((0, util_1.stripIndent)(`
            Este ramo ya está registrado con los siguientes datos:

            *Nombre*: ${result.name}
            *Código*: ${code}
            *Créditos*: ${result.credits}
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
        await this.client.db.insert('udec_subjects', builder => builder.values({
            code,
            credits,
            name,
        }));
        await context.fancyReply((0, util_1.stripIndent)(`
        *Añadido el ramo*:
        
        *Nombre*: ${name}
        *Código*: ${code}
        *Créditos*: ${credits}
        `), {
            'parse_mode': 'MarkdownV2',
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsZ0NBUWdCO0FBQ2hCLDRDQUFzRDtBQUN0RCxrQ0FBc0M7QUFFdEMsTUFBTSxrQkFBa0IsR0FBRyxtREFBbUQsQ0FBQztBQUMvRSxJQUFJLGNBQWdDLENBQUM7QUFDckMsTUFBTSxjQUFjLEdBQUc7SUFDbkIsSUFBSSxFQUFFLCtDQUErQztJQUNyRCxlQUFlLEVBQUUsaUNBQWlDO0NBQzVDLENBQUM7QUFFWCxNQUFNLGtCQUFrQixHQUFzQixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7S0FDdEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFcEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLFFBQVE7UUFDZixNQUFNLEVBQUUsa0JBQWtCO1FBQzFCLElBQUksRUFBRSxrQkFBWSxDQUFDLE1BQU07UUFDekIsR0FBRyxFQUFFLENBQUM7UUFDTixRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFzQyxDQUFDO0FBS3hDLE1BQXFCLGNBQWUsU0FBUSxhQUFnQjtJQUl4RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsaUJBQWlCO1lBQzlCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDMUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUs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