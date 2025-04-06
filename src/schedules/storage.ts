import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { LinearDataView } from "./linear-data-view";
import { ScheduleFile, SubjectSchedule } from "./types";

const scheduleFilesDir = path.join(process.cwd(), "resources/schedules");

if (!existsSync(scheduleFilesDir)) {
    mkdirSync(scheduleFilesDir, { recursive: true });
}

export function readScheduleFile(filename: string): ScheduleFile {
    const scheduleFilePath = path.join(scheduleFilesDir, filename);
    const scheduleFile: ScheduleFile = {
        updatedAt: 0,
        subjects: new Map(),
    };

    if (!existsSync(scheduleFilePath)) {
        return scheduleFile;
    }

    const file = readFileSync(scheduleFilePath);
    const dataView = new LinearDataView(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));

    scheduleFile.updatedAt = Number(dataView.getBigUint64());

    const subjectsAmount = dataView.getUint16();
    scheduleFile.subjects = new Map();

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

        scheduleFile.subjects.set(`${code}-${section}`, {
            code,
            name,
            credits,
            section,
            schedule,
        });
    }

    return scheduleFile;
}

export function saveScheduleFile(filename: string, scheduleFile: ScheduleFile): void {
    const textEncoder = new TextEncoder();

    const updatedAtBytes = new Uint8Array(8);
    new DataView(updatedAtBytes.buffer)
        .setBigUint64(0, BigInt(scheduleFile.updatedAt));

    const subjectsLengthBytes = new Uint8Array(2);
    new DataView(subjectsLengthBytes.buffer)
        .setUint16(0, scheduleFile.subjects.size);

    const subjectsBytes = [...scheduleFile.subjects.values()].flatMap(subject => {
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

    writeFileSync(path.join(scheduleFilesDir, filename), bytes, "utf-8");
}
