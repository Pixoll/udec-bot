import { config as dotenv } from 'dotenv';
dotenv();

import { client } from './client';

void async function (): Promise<void> {
    await client.login();
}();
