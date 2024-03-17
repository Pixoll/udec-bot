"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateToString = exports.capitalize = exports.isNullish = exports.omit = exports.xor = void 0;
function xor(a, b) {
    return !!((+a) ^ (+b));
}
exports.xor = xor;
function omit(obj, exclude) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const res = {};
    const keys = Object.keys(obj).filter(k => !exclude.includes(k));
    for (const key of keys) {
        res[key] = obj[key];
    }
    return res;
}
exports.omit = omit;
function isNullish(value) {
    return typeof value === 'undefined' || value === null;
}
exports.isNullish = isNullish;
function capitalize(text, restLower = false) {
    const rest = text.slice(1);
    return (text[0].toUpperCase() + (restLower ? rest.toLowerCase() : rest));
}
exports.capitalize = capitalize;
function dateToString(date) {
    return (date ?? new Date()).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Santiago',
    });
}
exports.dateToString = dateToString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxTQUFnQixHQUFHLENBQUMsQ0FBbUIsRUFBRSxDQUFtQjtJQUN4RCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRkQsa0JBRUM7QUFFRCxTQUFnQixJQUFJLENBQXNDLEdBQU0sRUFBRSxPQUFZO0lBQzFFLHlFQUF5RTtJQUN6RSxNQUFNLEdBQUcsR0FBRyxFQUFPLENBQUM7SUFDcEIsTUFBTSxJQUFJLEdBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RSxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQVJELG9CQVFDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEtBQWM7SUFDcEMsT0FBTyxPQUFPLEtBQUssS0FBSyxXQUFXLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQztBQUMxRCxDQUFDO0FBRkQsOEJBRUM7QUFFRCxTQUFnQixVQUFVLENBQW1CLElBQU8sRUFBRSxTQUFTLEdBQUcsS0FBSztJQUNuRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQWtCLENBQUM7QUFDOUYsQ0FBQztBQUhELGdDQUdDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLElBQWtCO0lBQzNDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUU7UUFDaEQsR0FBRyxFQUFFLFNBQVM7UUFDZCxLQUFLLEVBQUUsU0FBUztRQUNoQixJQUFJLEVBQUUsU0FBUztRQUNmLFFBQVEsRUFBRSxrQkFBa0I7S0FDL0IsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQVBELG9DQU9DIn0=