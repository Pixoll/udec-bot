"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const lib_1 = require("./lib");
(0, dotenv_1.config)();
const { OWNER_ID } = process.env;
if (!OWNER_ID) {
    throw new Error('A OWNER_ID env. variable must be specified.');
}
const client = new lib_1.TelegramClient({
    commandsDir: path_1.default.join(__dirname, './commands'),
    ownerId: +OWNER_ID,
});
client.login();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtQ0FBMEM7QUFDMUMsZ0RBQXdCO0FBQ3hCLCtCQUF1QztBQUV2QyxJQUFBLGVBQU0sR0FBRSxDQUFDO0FBRVQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFDakMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0FBQ25FLENBQUM7QUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFjLENBQUM7SUFDOUIsV0FBVyxFQUFFLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQztJQUMvQyxPQUFPLEVBQUUsQ0FBQyxRQUFRO0NBQ3JCLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyJ9