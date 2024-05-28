import axios from "axios";
import parseHtml from "node-html-parser";
import { TelegramClientType } from "../client";
import {
    Argument,
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
    Command,
    CommandContext,
    TelegramClient,
    capitalize,
    dateAtSantiago,
} from "../lib";
import { ActionType } from "../tables";
import { stripIndent } from "../util";

const subjectInfoBaseUrl = "https://alumnos.udec.cl/?q=node/25&codasignatura=";
const querySelectors = {
    infoId: "node-25",
    name: "div > div > div > div",
    listWithCredits: "div > div > div > ul",
} as const;

const romanNumeralsRegex: readonly RegExp[] = ["I", "II", "III", "IV", "V"]
    .map(n => new RegExp(`^${n}$`));

const args = [{
    key: "code",
    label: "código",
    prompt: "Ingrese el código del ramo.",
    type: ArgumentType.Number,
    min: 0,
    required: true,
    examples: ["/addramo 123456"],
    // @ts-expect-error: makes no difference
    validate(value, context, argument: Argument) {
        if (value.length !== 6) {
            return "El código debe tener 6 dígitos.";
        }
        return argument.typeHandler.validate(value, context, argument);
    },
} as const satisfies ArgumentOptions<ArgumentType.Number>] as const;

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

interface SubjectInfo {
    readonly name: string;
    readonly credits: number;
}

export default class AddRamoCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;

    public constructor(client: TelegramClient) {
        super(client, {
            name: "addramo",
            description: "Añade un ramo al grupo.",
            groupOnly: true,
            args,
        });
    }

    public async run(context: CommandContext, { code }: ArgsResult): Promise<void> {
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
            const subject = registeredSubject!;

            await context.fancyReply(stripIndent(`
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
        } catch (error) {
            await context.fancyReply("Hubo un error al añadir el ramo.");
            await this.client.catchError(error, context);
            return;
        }

        await context.fancyReply(stripIndent(`
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
                    timestamp: dateAtSantiago().toISOString().replace(/T|\.\d{3}Z$/g, ""),
                    type: ActionType.AddSubject,
                    username: context.from.full_username,
                })
                .executeTakeFirstOrThrow();
        } catch (error) {
            await this.client.catchError(error, context);
        }
    }
}

async function getSubjectInfo(code: number): Promise<SubjectInfo | null> {
    const response = await axios.get(subjectInfoBaseUrl + code);
    if (response.status < 200 || response.status >= 300) return null;

    const html = parseHtml(response.data);
    const infoSection = html.getElementById(querySelectors.infoId);
    if (!infoSection) return null;

    const name = infoSection.querySelector(querySelectors.name)?.innerText
        .replace(new RegExp(` - ${code}$`), "");
    if (!name) return null;

    const credits = [...(infoSection.querySelector(querySelectors.listWithCredits)?.childNodes ?? [])]
        .find(li => /^cr[eé]dito/.test(li.innerText.toLowerCase()))?.innerText
        .trim()
        .match(/\d+$/)?.[0];
    if (!credits) return null;

    return {
        name: parseSubjectName(name),
        credits: +credits,
    };
}

function parseSubjectName(name: string): string {
    return name.replace(/\?/g, "Ñ").trim().split(/\s+/)
        .map(w => {
            const isNumeral = romanNumeralsRegex.some(r => r.test(w.replace(/[^\w]+/g, "")));
            if (w === "PARA" || (w.length <= 3 && !isNumeral)) {
                return w.toLowerCase();
            }

            const restLower = w.length > 3 && !isNumeral;
            return capitalize(w, restLower);
        })
        .join(" ");
}
