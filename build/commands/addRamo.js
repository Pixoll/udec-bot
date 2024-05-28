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
const subjectInfoBaseUrl = "https://alumnos.udec.cl/?q=node/25&codasignatura=";
const querySelectors = {
    infoId: "node-25",
    name: "div > div > div > div",
    listWithCredits: "div > div > div > ul",
};
const romanNumeralsRegex = ["I", "II", "III", "IV", "V"]
    .map(n => new RegExp(`^${n}$`));
const args = [{
        key: "code",
        label: "código",
        prompt: "Ingrese el código del ramo.",
        type: lib_1.ArgumentType.Number,
        min: 0,
        required: true,
        examples: ["/addramo 123456"],
        // @ts-expect-error: makes no difference
        validate(value, context, argument) {
            if (value.length !== 6) {
                return "El código debe tener 6 dígitos.";
            }
            return argument.typeHandler.validate(value, context, argument);
        },
    }];
class AddRamoCommand extends lib_1.Command {
    constructor(client) {
        super(client, {
            name: "addramo",
            description: "Añade un ramo al grupo.",
            groupOnly: true,
            args,
        });
    }
    async run(context, { code }) {
        const isSubjectInChat = await this.client.db
            .selectFrom("udec_chat_subject")
            .select(["subject_code"])
            .where("chat_id", "=", `${context.chat.id}`)
            .where("subject_code", "=", code)
            .executeTakeFirst()
            .then(v => !!v);
        const registeredSubject = await this.client.db
            .selectFrom("udec_subject")
            .select(["name", "credits"])
            .where("code", "=", code)
            .executeTakeFirst();
        if (isSubjectInChat) {
            // never undefined thanks to foreign keys
            const subject = registeredSubject;
            await context.fancyReply((0, util_1.stripIndent)(`
            Este ramo ya está registrado con los siguientes datos:

            *Nombre*: ${subject.name}
            *Código*: ${code}
            *Créditos*: ${subject.credits}
            `), {
                "parse_mode": "MarkdownV2",
            });
            return;
        }
        const subjectInfo = registeredSubject ?? await getSubjectInfo(code);
        if (!subjectInfo) {
            await context.fancyReply("No se pudo encontrar información sobre el ramo.");
            return;
        }
        try {
            if (!registeredSubject) {
                await this.client.db
                    .insertInto("udec_subject")
                    .values({
                    code,
                    ...subjectInfo,
                })
                    .executeTakeFirstOrThrow();
            }
            await this.client.db
                .insertInto("udec_chat_subject")
                .values({
                chat_id: `${context.chat.id}`,
                subject_code: code,
            })
                .executeTakeFirstOrThrow();
        }
        catch (error) {
            await context.fancyReply("Hubo un error al añadir el ramo.");
            await this.client.catchError(error, context);
            return;
        }
        await context.fancyReply((0, util_1.stripIndent)(`
        ¡Ramo registrado\\! 🎉

        *Nombre*: ${subjectInfo.name}
        *Código*: ${code}
        *Créditos*: ${subjectInfo.credits}
        `), {
            "parse_mode": "MarkdownV2",
        });
        try {
            await this.client.db
                .insertInto("udec_action_history")
                .values({
                chat_id: `${context.chat.id}`,
                timestamp: (0, lib_1.dateAtSantiago)().toISOString().replace(/T|\.\d{3}Z$/g, ""),
                type: tables_1.ActionType.AddSubject,
                username: context.from.full_username,
            })
                .executeTakeFirstOrThrow();
        }
        catch (error) {
            await this.client.catchError(error, context);
        }
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
        .replace(new RegExp(` - ${code}$`), "");
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
    return name.replace(/\?/g, "Ñ").trim().split(/\s+/)
        .map(w => {
        const isNumeral = romanNumeralsRegex.some(r => r.test(w.replace(/[^\w]+/g, "")));
        if (w === "PARA" || (w.length <= 3 && !isNumeral)) {
            return w.toLowerCase();
        }
        const restLower = w.length > 3 && !isNumeral;
        return (0, lib_1.capitalize)(w, restLower);
    })
        .join(" ");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLHdFQUF5QztBQUV6QyxnQ0FVZ0I7QUFDaEIsc0NBQXVDO0FBQ3ZDLGtDQUFzQztBQUV0QyxNQUFNLGtCQUFrQixHQUFHLG1EQUFtRCxDQUFDO0FBQy9FLE1BQU0sY0FBYyxHQUFHO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLElBQUksRUFBRSx1QkFBdUI7SUFDN0IsZUFBZSxFQUFFLHNCQUFzQjtDQUNqQyxDQUFDO0FBRVgsTUFBTSxrQkFBa0IsR0FBc0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO0tBQ3RFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRXBDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLEtBQUssRUFBRSxRQUFRO1FBQ2YsTUFBTSxFQUFFLDZCQUE2QjtRQUNyQyxJQUFJLEVBQUUsa0JBQVksQ0FBQyxNQUFNO1FBQ3pCLEdBQUcsRUFBRSxDQUFDO1FBQ04sUUFBUSxFQUFFLElBQUk7UUFDZCxRQUFRLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztRQUM3Qix3Q0FBd0M7UUFDeEMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBa0I7WUFDdkMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNyQixPQUFPLGlDQUFpQyxDQUFDO1lBQzdDLENBQUM7WUFDRCxPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkUsQ0FBQztLQUNvRCxD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