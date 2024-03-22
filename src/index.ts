import { config as dotenv } from 'dotenv';
dotenv();

import { client } from './client';
import { Logger } from './lib';

void async function (): Promise<void> {
    await client.login();

    const expired = await client.db.select('udec_assignments', builder => builder.where({
        column: 'date_due',
        lessThan: new Date(),
    }));
    if (expired.ok && expired.result.length > 0) {
        await Promise.all(expired.result.map(a =>
            deleteExpiredAssignment(a.id, a.chat_id)
        ));
    }
}();

async function deleteExpiredAssignment(id: number, chatId: number): Promise<void> {
    const deleted = await client.db.delete('udec_assignments', builder => builder
        .where({
            column: 'id',
            equals: id,
        })
        .where({
            column: 'chat_id',
            equals: chatId,
        })
    );

    Logger.warn(deleted.ok
        ? `Deleted assignment (${id}, ${chatId}).`
        : `Failed to delete assignment (${id}, ${chatId}).`
    );
}
