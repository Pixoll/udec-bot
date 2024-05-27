import path from "path";
import { TelegramClient } from "./lib";
import { actionsHistoryTable, assignmentsTable, subjectsTable } from "./tables";

const { OWNER_ID } = process.env;
if (!OWNER_ID) {
    throw new Error("A OWNER_ID env. variable must be specified.");
}

export const client = new TelegramClient({
    commandsDir: path.join(__dirname, "./commands"),
    ownerId: +OWNER_ID,
    db: {
        tables: [
            subjectsTable,
            assignmentsTable,
            actionsHistoryTable,
        ] as const,
    },
});

export type TelegramClientType = typeof client;
