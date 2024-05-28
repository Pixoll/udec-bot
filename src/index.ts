import { config as dotenv } from "dotenv";
dotenv();

import { client } from "./client";
import { Logger, dateToString } from "./lib";
import { dateStringToSqlDate } from "./util";

void async function (): Promise<void> {
    await client.login();

    const expired = await client.db
        .selectFrom("udec_assignment")
        .selectAll()
        .where("date_due", "<", dateStringToSqlDate(dateToString()))
        .execute();

    if (expired.length > 0) {
        await client.db
            .deleteFrom("udec_assignment")
            .where("id", "in", expired.map(a => a.id))
            .execute();

        Logger.info("Deleted assignments:", expired);
    }
}();
