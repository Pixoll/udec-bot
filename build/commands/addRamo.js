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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsZ0NBUWdCO0FBQ2hCLDRDQUFzRDtBQUN0RCxrQ0FBc0M7QUFFdEMsTUFBTSxrQkFBa0IsR0FBRyxtREFBbUQsQ0FBQztBQUMvRSxJQUFJLGNBQWdDLENBQUM7QUFDckMsTUFBTSxjQUFjLEdBQUc7SUFDbkIsSUFBSSxFQUFFLCtDQUErQztJQUNyRCxlQUFlLEVBQUUsaUNBQWlDO0NBQzVDLENBQUM7QUFFWCxNQUFNLGtCQUFrQixHQUFzQixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7S0FDdEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFcEMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLFFBQVE7UUFDZixNQUFNLEVBQUUsa0JBQWtCO1FBQzFCLElBQUksRUFBRSxrQkFBWSxDQUFDLE1BQU07UUFDekIsR0FBRyxFQUFFLENBQUM7UUFDTixRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFzQyxDQUFDO0FBS3hDLE1BQXFCLGNBQWUsU0FBUSxhQUFnQjtJQUl4RCxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsaUJBQWlCO1lBQzlCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsRUFBRSxJQUFJLEVBQWM7UUFDMUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FB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