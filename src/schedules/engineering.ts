import axios from "axios";
import { mkdirSync, readFileSync } from "fs";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { LinearDataView } from "./linear-data-view";
import { pdfToCsv } from "./pdf-to-csv";
import { ClassDay, ClassType, Subject, SubjectSchedule } from "./types";

const scheduleFilesDir = path.join(process.cwd(), "resources/schedules");
const scheduleFilePath = path.join(scheduleFilesDir, "engineering.bin");

if (!existsSync(scheduleFilesDir)) {
    mkdirSync(scheduleFilesDir, { recursive: true });
}

// eslint-disable-next-line max-len
const subjectScheduleRegex = /(?:[[|l(]?(?<type>[TPL])(?: ?G(?<group>\d))?[\]|l)])? *(?:(?<day>Lu|Ma|Mi|Ju|Vi|Sa|Do) ?(?<blocks>[\d ,]+) ?\(?(?<classroom>[^)]+)\)|(?<tbd>Coordinar?(?: con)? docentes?))/gi;

export async function getEngineeringSchedule(): Promise<Map<string, Subject>> {
    const storedFile = readFile();

    const fileDocument = await axios.get<DocumentFileResponse>(
        "http://ofivirtualfi.udec.cl/api/file/documents/"
        + "?limit=1"
        + "&searchFields=resourceType,mimeType"
        + "&search=scheduleSubjects,application/pdf"
        + "&sort=id_file+desc"
        + "&exactMatching=true"
    ).then(r => r.data);

    if (!fileDocument.success) {
        throw new Error("Could not fetch latest subject information:", { cause: fileDocument });
    }

    const pdfFile = fileDocument.data.data[0];
    if (!pdfFile) {
        throw new Error("Could not find PDF file:", { cause: fileDocument });
    }

    const fileTimestamp = new Date(pdfFile.updatedAt ?? pdfFile.createdAt).getTime();
    if (fileTimestamp === storedFile.updatedAt) {
        return storedFile.subjects;
    }

    const csv = await pdfToCsv(`http://ofivirtualfi.udec.cl/api/file/downloadFile/${pdfFile.fileName}`);
    const subjects = await getSubjects(csv);

    storedFile.updatedAt = fileTimestamp;
    storedFile.subjects = subjects;
    saveFile(storedFile);

    return subjects;
}

function readFile(): EngineeringScheduleFile {
    const storedFile: EngineeringScheduleFile = {
        updatedAt: 0,
        subjects: new Map(),
    };

    if (!existsSync(scheduleFilePath)) {
        return storedFile;
    }

    const dataView = new LinearDataView(readFileSync(scheduleFilePath).buffer);

    storedFile.updatedAt = Number(dataView.getBigUint64());

    const subjectsAmount = dataView.getUint16();
    storedFile.subjects = new Map();

    for (let i = 0; i < subjectsAmount; i++) {
        const code = dataView.getUint32();
        const name = dataView.getString();

        let credits: number | undefined = dataView.getInt8();
        if (credits === -1) credits = undefined;

        const section = dataView.getUint8();

        const schedulesAmount = dataView.getUint8();
        const schedule = Array<SubjectSchedule>(schedulesAmount);

        for (let j = 0; j < schedulesAmount; j++) {
            const tbd = !!dataView.getUint8();

            let type: number | undefined = dataView.getInt8();
            if (type === -1) type = undefined;

            let group: number | undefined = dataView.getInt8();
            if (group === -1) group = undefined;

            if (tbd) {
                schedule[j] = { type, group, tbd };
                continue;
            }

            const day = dataView.getUint8();
            const blocksAmount = dataView.getUint8();
            const blocks = Array<number>(blocksAmount);

            for (let k = 0; k < blocksAmount; k++) {
                blocks[k] = dataView.getUint8();
            }

            const classroom = dataView.getString();

            schedule[j] = { type: type!, group, day, blocks, classroom };
        }

        storedFile.subjects.set(`${code}-${section}`, {
            code,
            name,
            credits,
            section,
            schedule,
        });
    }

    return storedFile;
}

function saveFile(storedFile: EngineeringScheduleFile): void {
    const textEncoder = new TextEncoder();

    const updatedAtBytes = new Uint8Array(8);
    new DataView(updatedAtBytes.buffer)
        .setBigUint64(0, BigInt(storedFile.updatedAt));

    const subjectsLengthBytes = new Uint8Array(2);
    new DataView(subjectsLengthBytes.buffer)
        .setUint16(0, storedFile.subjects.size);

    const subjectsBytes = [...storedFile.subjects.values()].flatMap(subject => {
        const codeBytes = new Uint8Array(4);
        new DataView(codeBytes.buffer)
            .setUint32(0, subject.code);

        const scheduleBytes = subject.schedule.flatMap(schedule =>
            "day" in schedule
                ? [
                    0,
                    schedule.type ?? -1,
                    schedule.group ?? -1,
                    schedule.day,
                    schedule.blocks.length,
                    ...schedule.blocks,
                    ...textEncoder.encode(schedule.classroom),
                    0,
                ]
                : [1, schedule.type ?? -1, schedule.group ?? -1]
        );

        return [
            ...codeBytes,
            ...textEncoder.encode(subject.name),
            0,
            subject.credits ?? -1,
            subject.section,
            subject.schedule.length,
            ...scheduleBytes,
        ];
    });

    const bytes = new Uint8Array([
        ...updatedAtBytes,
        ...subjectsLengthBytes,
        ...subjectsBytes,
    ]);

    writeFileSync(scheduleFilePath, bytes, "utf-8");
}

async function getSubjects(csv: string[][]): Promise<Map<string, Subject>> {
    const subjectRows = csv.filter((row): row is CsvRow => row.length === 10 && /^(\d{6})+$/m.test(row[0] ?? ""));
    const subjects = new Map<string, Subject>();

    await Promise.all(subjectRows.map<Promise<void>>(async (row) => {
        const codes = row[0].split("\n").map(c => +c);
        const sections = row[1].split("\n");
        const name = row[2].split("\n");
        const credits = row[3].split("\n").map(n => +n).filter(n => !Number.isNaN(n));
        const schedule = parseSubjectSchedule(row[8]);

        if (credits.length === 0) {
            const { data } = await axios.get<string>(`https://alumnos.udec.cl/?q=node/25&codasignatura=${codes[0]}`);
            const creditsString = data.match(/cr[eé]ditos *(?:<\/strong>)? *: *(\d+)/i)?.[1];

            if (creditsString) {
                credits.push(+creditsString);
            }
        }

        for (let i = 0; i < codes.length; i++) {
            const code = codes[i]!;
            const splitSections = codes.length === sections.length
                ? sections[i]!.trim().split(/\s*-\s*/)
                : sections;

            for (const section of splitSections) {
                const key = `${code}-${section}`;
                if (subjects.has(key)) continue;

                subjects.set(`${code}-${section}`, {
                    code,
                    name: name[i] ?? name[0]!,
                    credits: credits[i] ?? credits[0]!,
                    section: +section,
                    schedule,
                });
            }
        }
    }));

    return subjects;
}

function parseSubjectSchedule(text: string): SubjectSchedule[] {
    const scheduleMatches = text.replaceAll("\n", " ").matchAll(subjectScheduleRegex);
    const schedule: SubjectSchedule[] = [];

    let lastScheduleIndex = -1;
    for (const match of scheduleMatches) {
        const groups = match.groups as unknown as SubjectScheduleMatchGroups;

        let type = groups.type ? ClassType[groups.type.toUpperCase()] : undefined;
        const group = groups.group ? +groups.group : undefined;

        let i = lastScheduleIndex;
        while (i >= 0 && !type) {
            type = schedule[i--]?.type;
        }

        if (groups.tbd !== undefined) {
            schedule.push({
                type,
                group,
                tbd: true,
            });
            lastScheduleIndex++;
            continue;
        }

        if (type === undefined) {
            console.error("Could not resolve schedule from", groups);
            continue;
        }

        const day = ClassDay[groups.day.toUpperCase()];
        const blockStrings = groups.blocks?.match(/\d+/g) as string[] | null;
        const blocks = blockStrings?.flatMap(n => +n > 13 ? n.split("").map(m => +m) : +n) ?? [];
        const classroom = groups.classroom.trim();

        schedule.push({
            type,
            group,
            day,
            blocks,
            classroom,
        });
        lastScheduleIndex++;
    }

    return schedule;
}

type EngineeringScheduleFile = {
    updatedAt: number;
    subjects: Map<string, Subject>;
};

type SubjectScheduleMatchGroups = {
    type: Lowercase<keyof typeof ClassType> | undefined;
    group: string | undefined;
    day: Lowercase<keyof typeof ClassDay>;
    blocks: string | undefined;
    classroom: string;
    tbd: undefined;
} | {
    type: Lowercase<keyof typeof ClassType> | undefined;
    group: string | undefined;
    day: undefined;
    blocks: undefined;
    classroom: undefined;
    tbd: string;
};

type CsvRow = [string, string, string, string, string, string, string, string, string, string];

type DocumentFileResponse = {
    success: true;
    data: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        data: DocumentFile[];
    };
} | {
    success: false;
    errorCode: number;
    error: string;
};

type DocumentFile = {
    id_file: number;
    originalName: string;
    fileName: string;
    displayName: string | null;
    mimeType: string;
    size: number;
    encoding: string;
    filePath: string;
    destination: string;
    resourceId: number | null;
    resourceType: string;
    visibility: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
};

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface String {
        toUpperCase<S extends string>(this: S): Uppercase<S>;
    }
}
