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
                timestamp: (0, lib_1.timestampAtSantiago)(),
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
        const isNumeral = romanNumeralsRegex.some(r => r.test(w.replace(/\W+/g, "")));
        if (w === "PARA" || (w.length <= 3 && !isNumeral)) {
            return w.toLowerCase();
        }
        const restLower = w.length > 3 && !isNumeral;
        return (0, lib_1.capitalize)(w, restLower);
    })
        .join(" ");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUmFtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9hZGRSYW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQTBCO0FBQzFCLHdFQUF5QztBQUV6QyxnQ0FVZ0I7QUFDaEIsc0NBQXVDO0FBQ3ZDLGtDQUFzQztBQUV0QyxNQUFNLGtCQUFrQixHQUFHLG1EQUFtRCxDQUFDO0FBQy9FLE1BQU0sY0FBYyxHQUFHO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLElBQUksRUFBRSx1QkFBdUI7SUFDN0IsZUFBZSxFQUFFLHNCQUFzQjtDQUNqQyxDQUFDO0FBRVgsTUFBTSxrQkFBa0IsR0FBc0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO0tBQ3RFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRXBDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDVixHQUFHLEVBQUUsTUFBTTtRQUNYLEtBQUssRUFBRSxRQUFRO1FBQ2YsTUFBTSxFQUFFLDZCQUE2QjtRQUNyQyxJQUFJLEVBQUUsa0JBQVksQ0FBQyxNQUFNO1FBQ3pCLEdBQUcsRUFBRSxDQUFDO1FBQ04sUUFBUSxFQUFFLElBQUk7UUFDZCxRQUFRLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztRQUU3QixRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFrQjtZQUN2QyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3JCLE9BQU8saUNBQWlDLENBQUM7WUFDN0MsQ0FBQztZQUNELE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRSxDQUFDO0tBQ29ELENBQVUsQ0FBQztBQVdwRSxNQUFxQixjQUFlLFNBQVEsYUFBZ0I7SUFJeEQsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxTQUFTO1lBQ2YsV0FBVyxFQUFFLHlCQUF5QjtZQUN0QyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7U0FDUCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsSUFBSSxFQUFjO1FBQzFELE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2FBQ3ZDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQzthQUMvQixNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUN4QixLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7YUFDM0MsS0FBSyxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO2FBQ2hDLGdCQUFnQixFQUFFO2FBQ2xCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwQixNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2FBQ3pDLFVBQVUsQ0FBQyxjQUFjLENBQUM7YUFDMUIsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQzNCLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQzthQUN4QixnQkFBZ0IsRUFBRSxDQUFDO1FBRXhCLElBQUksZUFBZSxFQUFFLENBQUM7WUFFbEIsTUFBTSxPQUFPLEdBQUcsaUJBQWtCLENBQUM7WUFFbkMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUEsa0JBQVcsRUFBQzs7O3dCQUd6QixPQUFPLENBQUMsSUFBSTt3QkFDWixJQUFJOzBCQUNGLE9BQU8sQ0FBQyxPQUFPO2FBQzVCLENBQUMsRUFBRTtnQkFDQSxZQUFZLEVBQUUsWUFBWTthQUM3QixDQUFDLENBQUM7WUFDSCxPQUFPO1FBQ1gsQ0FBQztRQUVELE1BQU0sV0FBVyxHQUFHLGlCQUFpQixJQUFJLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNmLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO1lBQzVFLE9BQU87UUFDWCxDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3JCLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3FCQUNmLFVBQVUsQ0FBQyxjQUFjLENBQUM7cUJBQzFCLE1BQU0sQ0FBQztvQkFDSixJQUFJO29CQUNKLEdBQUcsV0FBVztpQkFDakIsQ0FBQztxQkFDRCx1QkFBdUIsRUFBRSxDQUFDO1lBQ25DLENBQUM7WUFFRCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtpQkFDZixVQUFVLENBQUMsbUJBQW1CLENBQUM7aUJBQy9CLE1BQU0sQ0FBQztnQkFDSixPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtnQkFDN0IsWUFBWSxFQUFFLElBQUk7YUFDckIsQ0FBQztpQkFDRCx1QkFBdUIsRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDN0MsT0FBTztRQUNYLENBQUM7UUFFRCxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBQSxrQkFBVyxFQUFDOzs7b0JBR3pCLFdBQVcsQ0FBQyxJQUFJO29CQUNoQixJQUFJO3NCQUNGLFdBQVcsQ0FBQyxPQUFPO1NBQ2hDLENBQUMsRUFBRTtZQUNBLFlBQVksRUFBRSxZQUFZO1NBQzdCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQztZQUNELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2lCQUNmLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQztpQkFDakMsTUFBTSxDQUFDO2dCQUNKLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUM3QixTQUFTLEVBQUUsSUFBQSx5QkFBbUIsR0FBRTtnQkFDaEMsSUFBSSxFQUFFLG1CQUFVLENBQUMsVUFBVTtnQkFDM0IsUUFBUSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYTthQUN2QyxDQUFDO2lCQUNELHVCQUF1QixFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBbEdELGlDQWtHQztBQUVELEtBQUssVUFBVSxjQUFjLENBQUMsSUFBWTtJQUN0QyxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQUssQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDNUQsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUc7UUFBRSxPQUFPLElBQUksQ0FBQztJQUVqRSxNQUFNLElBQUksR0FBRyxJQUFBLDBCQUFTLEVBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9ELElBQUksQ0FBQyxXQUFXO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFFOUIsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUztTQUNqRSxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFFdkIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEVBQUUsVUFBVSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQzdGLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUztTQUNyRSxJQUFJLEVBQUU7U0FDTixLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4QixJQUFJLENBQUMsT0FBTztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBRTFCLE9BQU87UUFDSCxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO1FBQzVCLE9BQU8sRUFBRSxDQUFDLE9BQU87S0FDcEIsQ0FBQztBQUNOLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLElBQVk7SUFDbEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1NBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNMLE1BQU0sU0FBUyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxLQUFLLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUNoRCxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDN0MsT0FBTyxJQUFBLGdCQUFVLEVBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQixDQUFDIn0=