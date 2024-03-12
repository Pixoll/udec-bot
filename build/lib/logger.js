"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const logPrefix = '[TGBot]';
exports.Logger = {
    info(...args) {
        console.log(logPrefix, ...args);
    },
    warn(...args) {
        console.warn(logPrefix, ...args);
    },
    error(...args) {
        console.error(logPrefix, ...args);
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBRWYsUUFBQSxNQUFNLEdBQUc7SUFDbEIsSUFBSSxDQUFDLEdBQUcsSUFBZTtRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFDRCxJQUFJLENBQUMsR0FBRyxJQUFlO1FBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUNELEtBQUssQ0FBQyxHQUFHLElBQWU7UUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBQ0osQ0FBQyJ9