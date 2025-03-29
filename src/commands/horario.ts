import { launch } from "puppeteer";
import { TelegramClientType } from "../client";
import {
    Argument,
    ArgumentOptions,
    ArgumentOptionsToResult,
    ArgumentType,
    Command,
    CommandContext,
    TelegramClient,
} from "../lib";
import { ClassDay, ClassType, getEngineeringSchedule, Subject, SubjectScheduleDefined } from "../schedules";

enum SlotType {
    UNIQUE = "top-and-bottom-radius",
    START = "top-radius",
    MIDDLE = "fill",
    END = "bottom-radius",
}

const classTypeToString: Record<ClassType, string> = {
    [ClassType.T]: "T",
    [ClassType.P]: "P",
    [ClassType.L]: "L",
};

const args = [{
    key: "codes",
    label: "códigos-con-sección",
    prompt: "Ingrese los códigos de los ramos junto a la sección.",
    type: ArgumentType.String,
    min: 0,
    required: true,
    infinite: true,
    examples: ["/horario 123456 789012-3 ..."],
    // @ts-expect-error: makes no difference
    async validate(value, context, argument: Argument) {
        const [code = "", section = ""] = value.split("-");
        if (code.length !== 6) {
            return {
                ok: false,
                message: "El código debe tener 6 dígitos.",
            };
        }

        const numberArgTypeHandler = argument.client.registry.types.get(ArgumentType.Number);
        const numberArg = argument as Argument<ArgumentType.Number>;

        const codeValidationResult = await numberArgTypeHandler.validate(code, context, numberArg);
        if (!codeValidationResult.ok) return codeValidationResult;

        if (!section) return { ok: true };

        return numberArgTypeHandler.validate(section, context, numberArg);
    },
    parse(value: string) {
        const [code, section = "1"] = value.split("-");
        return `${code}-${section}`;
    },
} as const satisfies ArgumentOptions<ArgumentType.String>] as const;

type RawArgs = typeof args;
type ArgsResult = ArgumentOptionsToResult<RawArgs>;

// noinspection JSUnusedGlobalSymbols
export default class HorarioCommand extends Command<RawArgs> {
    // @ts-expect-error: type override
    public declare readonly client: TelegramClientType;
    private readonly subjects: Map<string, Subject>;
    private readonly schedulesAmount: number;
    // noinspection TypeScriptFieldCanBeMadeReadonly
    private schedulesReady: number;

    public constructor(client: TelegramClient) {
        super(client, {
            name: "horario",
            description: "Crea el horario de tus ramos (solo facultad de ingeniería por ahora).",
            args,
        });

        this.subjects = new Map();
        this.schedulesAmount = 1;
        this.schedulesReady = 0;

        getEngineeringSchedule()
            .then(schedule => {
                for (const [key, value] of schedule) {
                    this.subjects.set(key, value);
                }
                this.schedulesReady++;
            })
            .catch(console.error);
    }

    public async run(context: CommandContext, { codes }: ArgsResult): Promise<void> {
        if (this.schedulesReady !== this.schedulesAmount) {
            const message = await context.fancyReply("Por favor espera mientras termino de obtener los horarios...");
            await this.waitForSchedules();

            if (message) {
                await context.telegram.deleteMessage(context.chat.id, message.message_id).catch(() => null);
            }
        }

        const subjects = new Map<number, Subject>();

        for (const code of codes) {
            const subject = this.subjects.get(code);
            if (!subject) {
                await context.fancyReply(
                    `No se pudo encontrar información sobre el ramo ${code}.\n`
                    + "Recuerda que por ahora solo se puede armar el horario con ramos de la facultad de ingeniería."
                );
                return;
            }

            if (subjects.has(subject.code)) {
                await context.fancyReply(`El ramo ${subject.code} se encuentra repetido.`);
                return;
            }

            subjects.set(subject.code, subject);
        }

        await context.fancyReply("Por favor espera mientras se genera tu horario...");

        const groupSubjectsResult = groupSubjects(subjects);
        const lightModeHtml = generateHtml(groupSubjectsResult);
        const darkModeHtml = generateHtml(groupSubjectsResult, true);

        try {
            const { lightModeImage, darkModeImage } = await htmlToImage(lightModeHtml, darkModeHtml);

            await context.fancyReplyWithMediaGroup([{
                type: "document",
                media: {
                    source: lightModeImage,
                    filename: "horario-claro.png",
                },
            }, {
                type: "document",
                media: {
                    source: darkModeImage,
                    filename: "horario-oscuro.png",
                },
                caption: "Aquí está tu horario.",
            }]);
        } catch (error) {
            await this.client.catchError(error, context);
        }
    }

    private waitForSchedules(): Promise<void> {
        return new Promise(resolve => {
            const timeoutTimer = setTimeout(() => {
                console.error(new Error(`${this.waitForSchedules.name} timed out after 3 minutes.`));
                resolve();
            }, 180_000); // 3m

            const timer = setInterval(() => {
                if (this.schedulesReady === this.schedulesAmount) {
                    clearTimeout(timeoutTimer);
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    }
}

async function htmlToImage(lightModeHtml: string, darkModeHtml: string): Promise<{
    lightModeImage: Buffer;
    darkModeImage: Buffer;
}> {
    using browser = await launch({
        // TODO not safe on linux, should find a workaround
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    using page = await browser.newPage();

    await page.setContent(lightModeHtml);
    const lightBody = await page.$("div.root");
    if (!lightBody) {
        throw new Error("Could not find body");
    }

    const lightModeImage = Buffer.from(await lightBody.screenshot({
        captureBeyondViewport: true,
        optimizeForSpeed: true,
        type: "png",
    }));

    await page.setContent(darkModeHtml);
    const darkBody = await page.$("div.root");
    if (!darkBody) {
        throw new Error("Could not find body");
    }

    const darkModeImage = Buffer.from(await darkBody.screenshot({
        captureBeyondViewport: true,
        optimizeForSpeed: true,
        type: "png",
    }));

    return { lightModeImage, darkModeImage };
}

function generateHtml({ groupedSubjects, subjectIds }: GroupSubjectsResult, darkMode = false): string {
    return `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <title>Document</title>
      <style>
        body {
          margin: 0;
        }

        .root {
          background-color: ${darkMode ? "#222328" : "white"};
          color: ${darkMode ? "white" : "black"};
          font-family: Arial, Helvetica, sans-serif;
          font-size: 32px;
          padding: 1em;
          width: fit-content;
        }

        .schedule {
          display: grid;
          grid-template-columns: fit-content(0) repeat(5, 16em);
        }

        .day-header {
          align-content: center;
          height: 2em;
          text-align: center;
        }

        .slot-label {
          align-content: center;
          display: grid;
          gap: 0.5em;
          height: 8em;
          padding-left: 0.5em;
          padding-right: 0.5em;
          text-align: center;
        }

        .slot-timespan {
          color: grey;
          font-size: 0.6em;
        }

        .slots-container {
          border-bottom: 1px solid;
          border-bottom-color: ${darkMode ? "#3d3e43" : "#ddd"};
          border-right: 1px solid;
          border-right-color: ${darkMode ? "#3d3e43" : "#ddd"};
          color: white;
          display: grid;
          text-wrap: wrap;
          word-break: break-word;
        }

        .schedule > *:nth-child(6n) {
          border-right: none;
        }

        .schedule > *:nth-last-child(-n + 5) {
          border-bottom: none;
        }

        .slots-container:has([class*="subject-slot"]):is(:has([class*="top-radius"]), :has([class*="fill"])) {
          border-bottom: none;
        }

        .top-radius, .top-and-bottom-radius {
          border-top-left-radius: 0.5em;
          border-top-right-radius: 0.5em;
          height: calc(100% - 0.1em);
          margin-top: 0.1em;
        }

        .bottom-radius, .top-and-bottom-radius {
          border-bottom-left-radius: 0.5em;
          border-bottom-right-radius: 0.5em;
          height: calc(100% - 0.1em);
          margin-bottom: 0.1em;
        }

        .top-and-bottom-radius {
          height: calc(100% - 0.2em) !important;
        }

        .fill {
          height: 100%;
        }

        .subject-slot {
          box-sizing: border-box;
          margin-left: 0.1em;
          margin-right: 0.1em;
          padding: 0.5em;
        }

        .subject-name {
          display: block;
          font-weight: bold;
        }

        .subject-classroom {
          color: rgba(255, 255, 255, 0.75);
          display: block;
          margin-top: 0.25em;
        }

        .subject-0 {
          background-color: #f44236; /* tomato */
        }

        .subject-1 {
          background-color: #ff9700; /* orange */
        }

        .subject-2 {
          background-color: #4cb050; /* yellowgreen */
        }

        .subject-3 {
          background-color: #2196f3; /* 00bcd5 mediumaquamarine */
        }

        .subject-4 {
          background-color: #3f51b5; /* royalblue */
        }

        .subject-5 {
          background-color: #9c45b0; /* 9c28b1 darkorchid */
        }

        .subject-6 {
          background-color: #a98273; /* rosybrown */
        }

        .subject-7 {
          background-color: #a96214; /* c66901 saddlebrown */
        }

        .subject-8 {
          background-color: #af0039; /* 087f23 darkgreen */
        }

        .subject-9 {
          background-color: #34525d; /* 00685a darkslategray */
        }
      </style>
    </head>
    <body>
    <div class="root">
      <div class="schedule">
        <div></div>
        <div class="day-header">Lunes</div>
        <div class="day-header">Martes</div>
        <div class="day-header">Miércoles</div>
        <div class="day-header">Jueves</div>
        <div class="day-header">Viernes</div>

        ${Array.from({ length: 13 }, (_, i) => {
        const subjects = [
            groupedSubjects.get(`${ClassDay.LU}-${i + 1}`) ?? [],
            groupedSubjects.get(`${ClassDay.MA}-${i + 1}`) ?? [],
            groupedSubjects.get(`${ClassDay.MI}-${i + 1}`) ?? [],
            groupedSubjects.get(`${ClassDay.JU}-${i + 1}`) ?? [],
            groupedSubjects.get(`${ClassDay.VI}-${i + 1}`) ?? [],
        ];

        return `
        <div class="slot-label">
          <span class="slot-number">${i + 1}</span>
          <span class="slot-timespan">${i + 8}:00 ${i + 9}:00</span>
        </div>
        ${subjects.map(subjects => `
        <div class="slots-container" style="grid-template-columns: repeat(${subjects.length}, 1fr)">
          ${subjects.map(subject => `
          <div class="subject-slot ${subject.slotType} subject-${subjectIds.get(subject.code)}">
            ${subject.slotType === SlotType.UNIQUE || subject.slotType === SlotType.START ? `
            <span class="subject-name">${subject.code}-${subject.section} ${subject.name}</span>
            ${subject.classrooms.map(classroom => `
            <span class="subject-classroom">
              [${classTypeToString[subject.type]}${classroom.group ? ` G${classroom.group}` : ""}]
              ${classroom.classroom}
            </span>
            `).join("").trim()}
            ` : ""}
          </div>
          `).join("").trim()}
        </div>
        `).join("").trim()}
        `;
    }).join("").trim()}
      </div>
    </div>
    </body>
    </html>
    `.trim().replace(/^ {4}/gm, "");
}

function groupSubjects(subjects: Map<number, Subject>): GroupSubjectsResult {
    const groupedSubjects = new Map<`${ClassDay}-${number}`, GroupedSubject[]>();
    const subjectIds = new Map<number, number>();
    const tbd: string[] = [];

    const iterator = {
        * [Symbol.iterator]() {
            let lastSubjectId = 0;
            for (const subject of subjects.values()) {
                subjectIds.set(subject.code, lastSubjectId++);

                for (const slot of subject.schedule) {
                    if ("tbd" in slot) {
                        tbd.push(`${subject.code}-${subject.section}`);
                        continue;
                    }

                    const sortedBlocks = slot.blocks.toSorted();

                    for (let i = 0; i < sortedBlocks.length; i++) {
                        yield {
                            subject,
                            slot,
                            sortedBlocks,
                            block: sortedBlocks[i]!,
                            i,
                        };
                    }
                }
            }
        },
    };

    for (const { subject, slot, sortedBlocks, block, i } of iterator) {
        const subjectsGroup = groupedSubjects.get(`${slot.day}-${block}`);
        const slotType = sortedBlocks.length === 1 ? SlotType.UNIQUE
            : i === 0 ? SlotType.START
                : i === sortedBlocks.length - 1 ? SlotType.END
                    : SlotType.MIDDLE;

        const groupedSubject: GroupedSubject = {
            code: subject.code,
            section: subject.section,
            name: subject.name,
            type: slot.type,
            blocks: sortedBlocks,
            classrooms: [{
                group: slot.group,
                classroom: slot.classroom,
            }],
            conflicts: new Set(),
            slotType,
            equals(other: GroupedSubject) {
                return this.code === other.code && this.blocks.toString() === other.blocks.toString();
            },
        };

        if (!subjectsGroup) {
            groupedSubjects.set(`${slot.day}-${block}`, [groupedSubject]);
            continue;
        }

        let foundEqual = false;
        for (const subjectInGroup of subjectsGroup) {
            if (!subjectInGroup.equals(groupedSubject)) {
                subjectInGroup.conflicts.add(groupedSubject);
                groupedSubject.conflicts.add(subjectInGroup);
                continue;
            }

            const hasClassroomAlready = subjectInGroup.classrooms.some(c =>
                c.group === slot.group && c.classroom === slot.classroom
            );

            if (!hasClassroomAlready) {
                subjectInGroup.classrooms.push({
                    group: slot.group,
                    classroom: slot.classroom,
                });
            }

            foundEqual = true;
        }

        if (!foundEqual) {
            subjectsGroup.push(groupedSubject);
        }
    }

    return { groupedSubjects, subjectIds, tbd };
}

type GroupSubjectsResult = {
    groupedSubjects: Map<`${ClassDay}-${number}`, GroupedSubject[]>;
    subjectIds: Map<number, number>;
    tbd: string[];
};

type GroupedSubject =
    & Pick<Subject, "code" | "section" | "name">
    & Pick<SubjectScheduleDefined, "type" | "blocks">
    & {
    classrooms: Array<Pick<SubjectScheduleDefined, "group" | "classroom">>;
    conflicts: Set<GroupedSubject>;
    slotType: SlotType;
    equals(other: GroupedSubject): boolean;
};
