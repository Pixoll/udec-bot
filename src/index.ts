import { config as dotenv } from 'dotenv';
import path from 'path';
import { TelegramClient } from './lib';

dotenv();

const { OWNER_ID } = process.env;
if (!OWNER_ID) {
    throw new Error('A OWNER_ID env. variable must be specified.');
}

const client = new TelegramClient({
    commandsDir: path.join(__dirname, './commands'),
    ownerId: +OWNER_ID,
});

client.login();
