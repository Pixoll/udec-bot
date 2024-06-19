import { config as dotenv } from "dotenv";
dotenv();

import { client } from "./client";
import { clearOldAssignments } from "./util";

void async function (): Promise<void> {
    await client.login();
    await clearOldAssignments(client);
}();
