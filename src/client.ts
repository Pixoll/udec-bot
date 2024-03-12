import path from 'path';
import { TelegramClient } from './lib';
import { Database } from './db';

const { OWNER_ID } = process.env;
if (!OWNER_ID) {
    throw new Error('A OWNER_ID env. variable must be specified.');
}

export const client = new TelegramClient({
    commandsDir: path.join(__dirname, './commands'),
    ownerId: +OWNER_ID,
});

export const db = new Database(client);

client.beforeLogin(() => db.connect());
