"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const path_1 = __importDefault(require("path"));
const lib_1 = require("./lib");
const { OWNER_ID } = process.env;
if (!OWNER_ID) {
    throw new Error("A OWNER_ID env. variable must be specified.");
}
exports.client = new lib_1.TelegramClient({
    commandsDir: path_1.default.join(__dirname, "./commands"),
    ownerId: +OWNER_ID,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxnREFBd0I7QUFDeEIsK0JBQXVDO0FBR3ZDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ2pDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRVksUUFBQSxNQUFNLEdBQUcsSUFBSSxvQkFBYyxDQUFXO0lBQy9DLFdBQVcsRUFBRSxjQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7SUFDL0MsT0FBTyxFQUFFLENBQUMsUUFBUTtDQUNyQixDQUFDLENBQUMifQ==