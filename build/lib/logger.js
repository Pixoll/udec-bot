"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const logPrefix = '[TGBot]';
class Logger extends null {
    static info(...args) {
        console.log(logPrefix, ...args);
    }
    static warn(...args) {
        console.warn(logPrefix, ...args);
    }
    static error(...args) {
        console.error(logPrefix, ...args);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBRTVCLE1BQWEsTUFBTyxTQUFRLElBQUk7SUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQWU7UUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU0sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQWU7UUFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQWU7UUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBQ0o7QUFaRCx3QkFZQyJ9