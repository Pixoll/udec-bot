"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.client = void 0;
const path_1 = __importDefault(require("path"));
const lib_1 = require("./lib");
const db_1 = require("./db");
const { OWNER_ID } = process.env;
if (!OWNER_ID) {
    throw new Error('A OWNER_ID env. variable must be specified.');
}
exports.client = new lib_1.TelegramClient({
    commandsDir: path_1.default.join(__dirname, './commands'),
    ownerId: +OWNER_ID,
});
exports.db = new db_1.Database(exports.client);
exports.client.beforeLogin(() => exports.db.connect());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxnREFBd0I7QUFDeEIsK0JBQXVDO0FBQ3ZDLDZCQUFnQztBQUVoQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUNqQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDWixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7QUFDbkUsQ0FBQztBQUVZLFFBQUEsTUFBTSxHQUFHLElBQUksb0JBQWMsQ0FBQztJQUNyQyxXQUFXLEVBQUUsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDO0lBQy9DLE9BQU8sRUFBRSxDQUFDLFFBQVE7Q0FDckIsQ0FBQyxDQUFDO0FBRVUsUUFBQSxFQUFFLEdBQUcsSUFBSSxhQUFRLENBQUMsY0FBTSxDQUFDLENBQUM7QUFFdkMsY0FBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyJ9