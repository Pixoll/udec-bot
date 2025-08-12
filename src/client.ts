import { config as dotenv } from "dotenv";
import path from "path";
import { TelegramClient } from "./lib";
import { Database } from "./tables";

dotenv({ quiet: true });

const { OWNER_ID } = process.env;
if (!OWNER_ID) {
    throw new Error("A OWNER_ID env. variable must be specified.");
}

export const client = new TelegramClient<Database>({
    commandsDir: path.join(__dirname, "./commands"),
    ownerId: +OWNER_ID,
});

export type TelegramClientType = typeof client;
