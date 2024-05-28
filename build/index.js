"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const client_1 = require("./client");
const lib_1 = require("./lib");
const util_1 = require("./util");
void async function () {
    await client_1.client.login();
    const expired = await client_1.client.db
        .selectFrom("udec_assignment")
        .selectAll()
        .where("date_due", "<", (0, util_1.dateStringToSqlDate)((0, lib_1.dateToString)()))
        .execute();
    if (expired.length > 0) {
        await client_1.client.db
            .deleteFrom("udec_assignment")
            .where("id", "in", expired.map(a => a.id))
            .execute();
        lib_1.Logger.info("Deleted assignments:", expired);
    }
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBMEM7QUFDMUMsSUFBQSxlQUFNLEdBQUUsQ0FBQztBQUVULHFDQUFrQztBQUNsQywrQkFBNkM7QUFDN0MsaUNBQTZDO0FBRTdDLEtBQUssS0FBSztJQUNOLE1BQU0sZUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBRXJCLE1BQU0sT0FBTyxHQUFHLE1BQU0sZUFBTSxDQUFDLEVBQUU7U0FDMUIsVUFBVSxDQUFDLGlCQUFpQixDQUFDO1NBQzdCLFNBQVMsRUFBRTtTQUNYLEtBQUssQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUEsMEJBQW1CLEVBQUMsSUFBQSxrQkFBWSxHQUFFLENBQUMsQ0FBQztTQUMzRCxPQUFPLEVBQUUsQ0FBQztJQUVmLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLGVBQU0sQ0FBQyxFQUFFO2FBQ1YsVUFBVSxDQUFDLGlCQUFpQixDQUFDO2FBQzdCLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDekMsT0FBTyxFQUFFLENBQUM7UUFFZixZQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUM7QUFDTCxDQUFDLEVBQUUsQ0FBQyJ9