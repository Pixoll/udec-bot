"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const client_1 = require("./client");
const util_1 = require("./util");
void async function () {
    await client_1.client.login();
    await (0, util_1.clearOldAssignments)(client_1.client);
}();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBMEM7QUFDMUMsSUFBQSxlQUFNLEdBQUUsQ0FBQztBQUVULHFDQUFrQztBQUNsQyxpQ0FBNkM7QUFFN0MsS0FBSyxLQUFLO0lBQ04sTUFBTSxlQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsTUFBTSxJQUFBLDBCQUFtQixFQUFDLGVBQU0sQ0FBQyxDQUFDO0FBQ3RDLENBQUMsRUFBRSxDQUFDIn0=