import { config as dotenv } from "dotenv";
import { client } from "./client";
import { clearOldAssignments } from "./util";

dotenv({ quiet: true });

void async function (): Promise<void> {
    await client.login();
    await clearOldAssignments(client);
}();
