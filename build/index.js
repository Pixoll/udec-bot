"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const client_1 = require("./client");
const lib_1 = require("./lib");
void async function () {
    await client_1.client.login();
    const expired = await client_1.client.db
        .selectFrom("udec_assignment")
        .selectAll()
        .where("date_due", "<", (0, lib_1.dateToString)())
        .execute();
    if (expired.length > 0) {
        const deleted = await client_1.client.db
            .deleteFrom("udec_assignment")
            .where("id", "in", expired.map(a => a.id))
            .execute();
        lib_1.Logger.info("Deleted assignments:", deleted);
    }
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBMEM7QUFDMUMsSUFBQSxlQUFNLEdBQUUsQ0FBQztBQUVULHFDQUFrQztBQUNsQywrQkFBNkM7QUFFN0MsS0FBSyxLQUFLO0lBQ04sTUFBTSxlQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFFckIsTUFBTSxPQUFPLEdBQUcsTUFBTSxlQUFNLENBQUMsRUFBRTtTQUMxQixVQUFVLENBQUMsaUJBQWlCLENBQUM7U0FDN0IsU0FBUyxFQUFFO1NBQ1gsS0FBSyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBQSxrQkFBWSxHQUFFLENBQUM7U0FDdEMsT0FBTyxFQUFFLENBQUM7SUFFZixJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDckIsTUFBTSxPQUFPLEdBQUcsTUFBTSxlQUFNLENBQUMsRUFBRTthQUMxQixVQUFVLENBQUMsaUJBQWlCLENBQUM7YUFDN0IsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN6QyxPQUFPLEVBQUUsQ0FBQztRQUVmLFlBQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztBQUNMLENBQUMsRUFBRSxDQUFDIn0=