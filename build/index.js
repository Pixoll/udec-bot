"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const client_1 = require("./client");
const lib_1 = require("./lib");
void async function () {
    await client_1.client.login();
    const expired = await client_1.client.db.select('udec_assignments', builder => builder.where({
        column: 'date_due',
        lessThan: new Date(),
    }));
    if (expired.ok && expired.result.length > 0) {
        await Promise.all(expired.result.map(a => deleteExpiredAssignment(a.id, a.chat_id)));
    }
}();
async function deleteExpiredAssignment(id, chatId) {
    const deleted = await client_1.client.db.delete('udec_assignments', builder => builder
        .where({
        column: 'id',
        equals: id,
    })
        .where({
        column: 'chat_id',
        equals: chatId,
    }));
    lib_1.Logger.warn(deleted.ok
        ? `Deleted assignment (${id}, ${chatId}).`
        : `Failed to delete assignment (${id}, ${chatId}).`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBMEM7QUFDMUMsSUFBQSxlQUFNLEdBQUUsQ0FBQztBQUVULHFDQUFrQztBQUNsQywrQkFBK0I7QUFFL0IsS0FBSyxLQUFLO0lBQ04sTUFBTSxlQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFFckIsTUFBTSxPQUFPLEdBQUcsTUFBTSxlQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDaEYsTUFBTSxFQUFFLFVBQVU7UUFDbEIsUUFBUSxFQUFFLElBQUksSUFBSSxFQUFFO0tBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ0osSUFBSSxPQUFPLENBQUMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzFDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUNyQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDM0MsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztBQUNMLENBQUMsRUFBRSxDQUFDO0FBRUosS0FBSyxVQUFVLHVCQUF1QixDQUFDLEVBQVUsRUFBRSxNQUFjO0lBQzdELE1BQU0sT0FBTyxHQUFHLE1BQU0sZUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPO1NBQ3hFLEtBQUssQ0FBQztRQUNILE1BQU0sRUFBRSxJQUFJO1FBQ1osTUFBTSxFQUFFLEVBQUU7S0FDYixDQUFDO1NBQ0QsS0FBSyxDQUFDO1FBQ0gsTUFBTSxFQUFFLFNBQVM7UUFDakIsTUFBTSxFQUFFLE1BQU07S0FDakIsQ0FBQyxDQUNMLENBQUM7SUFFRixZQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ2xCLENBQUMsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLE1BQU0sSUFBSTtRQUMxQyxDQUFDLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxNQUFNLElBQUksQ0FDdEQsQ0FBQztBQUNOLENBQUMifQ==