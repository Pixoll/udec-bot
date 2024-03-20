"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const node_html_parser_1 = __importDefault(require("node-html-parser"));
const lib_1 = require("../lib");
const tables_1 = require("../tables");
const util_1 = require("../util");
const subjectInfoBaseUrl = 'https://alumnos.udec.cl/?q=node/25&codasignatura=';
const querySelectors = {
    infoId: 'node-25',
    name: 'div > div > div > div',
    listWithCredits: 'div > div > div > ul',
};
const romanNumeralsRegex = ['I', 'II', 'III', 'IV', 'V']
    .map(n => new RegExp(`^${n}$`));
const args = [{
        key: 'code',
        label: 'código',
        prompt: (0, lib_1.escapeMarkdown)('Ingrese el código del ramo.'),
        type: lib_1.ArgumentType.Number,
        min: 0,
        required: true,
        example: (0, lib_1.escapeMarkdown)('Ejemplo: `/addramo 123456`.', '`'),
        // @ts-expect-error: makes no difference
        validate(value, context, argument) {
            if (value.length !== 6) {
                return 'El código debe tener 6 dígitos.';
            }
            return argument.typeHandler.validate(value, context, argument);
        },
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
        const subjectInfo = await getSubjectInfo(code);
        if (!subjectInfo) {
            await context.fancyReply('No se pudo encontrar información sobre el ramo.');
            return;
        }
        const inserted = await this.client.db.insert('udec_subjects', builder => builder.values({
            code,
            ...subjectInfo,
            'chat_id': chatId,
        }));
        if (!inserted.ok) {
            await context.fancyReply('Hubo un error al añadir el ramo.');
            await this.client.catchError(inserted.error, context);
            return;
        }
        await context.fancyReply((0, util_1.stripIndent)(`
        ¡Ramo registrado\\! 🎉

        *Nombre*: ${subjectInfo.name}
        *Código*: ${code}
        *Créditos*: ${subjectInfo.credits}
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
async function getSubjectInfo(code) {
    const response = await axios_1.default.get(subjectInfoBaseUrl + code);
    if (response.status < 200 || response.status >= 300)
        return null;
    const html = (0, node_html_parser_1.default)(response.data);
    const infoSection = html.getElementById(querySelectors.infoId);
    if (!infoSection)
        return null;
    const name = infoSection.querySelector(querySelectors.name)?.innerText
        .replace(new RegExp(` - ${code}$`), '');
    if (!name)
        return null;
    const credits = [...(infoSection.querySelector(querySelectors.listWithCredits)?.childNodes ?? [])]
        .find(li => /^cr[eé]dito/.test(li.innerText.toLowerCase()))?.innerText
        .trim()
        .match(/\d+$/)?.[0];
    if (!credits)
        return null;
    return {
        name: parseSubjectName(name),
        credits: +credits,
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLHdFQUF5QztBQUV6QyxnQ0FVZ0I7QUFDaEIsc0NBQXVDO0FBQ3ZDLGtDQUFzQztBQUV0QyxNQUFNLGtCQUFrQixHQUFHLG1EQUFtRCxDQUFDO0FBQy9FLE1BQU0sY0FBYyxHQUFHO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLElBQUksRUFBRSx1QkFBdUI7SUFDN0IsZUFBZSxFQUFFLHNCQUFzQjtDQUNqQyxDQUFDO0FBRVgsTUFBTSxrQkFBa0IsR0FBc0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO0tBQ3RFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRXBDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLEtBQUssRUFBRSxRQUFRO1FBQ2YsTUFBTSxFQUFFLElBQUEsb0JBQWMsRUFBQyw2QkFBNkIsQ0FBQztRQUNyRCxJQUFJLEVBQUUsa0JBQVksQ0FBQyxNQUFNO1FBQ3pCLEdBQUcsRUFBRSxDQUFDO1FBQ04sUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsSUFBQSxvQkFBYyxFQUFDLDZCQUE2QixFQUFFLEdBQUcsQ0FBQztRQUMzRCx3Q0FBd0M7UUFDeEMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBa0I7WUFDdkMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNyQixPQUFPLGlDQUFpQyxDQUFDO1lBQzdDLENBQUM7WUFDRCxPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxP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