"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateAtSantiago = exports.getTimeZoneOffset = exports.dateToString = exports.capitalize = exports.isNullish = exports.omit = exports.xor = void 0;
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
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Santiago',
    }).format(date ?? new Date());
}
exports.dateToString = dateToString;
function getTimeZoneOffset(timeZone) {
    const date = new Date();
    const iso = date.toLocaleString('en-CA', { timeZone, hour12: false })
        .replace(', ', 'T')
        .replace('T24:', 'T00:')
        + '.'
        + date.getMilliseconds().toString().padStart(3, '0');
    const lie = new Date(iso);
    return -(lie.getTime() - date.getTime()) / 60 / 1000;
}
exports.getTimeZoneOffset = getTimeZoneOffset;
const santiagoDateOffset = getTimeZoneOffset('America/Santiago');
function dateAtSantiago(date) {
    const dateObj = date ? new Date(date) : new Date();
    const ms = dateObj.getTime();
    return new Date(ms + santiagoDateOffset);
}
exports.dateAtSantiago = dateAtSantiago;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxTQUFnQixHQUFHLENBQUMsQ0FBbUIsRUFBRSxDQUFtQjtJQUN4RCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRkQsa0JBRUM7QUFFRCxTQUFnQixJQUFJLENBQXNDLEdBQU0sRUFBRSxPQUFZO0lBQzFFLHlFQUF5RTtJQUN6RSxNQUFNLEdBQUcsR0FBRyxFQUFPLENBQUM7SUFDcEIsTUFBTSxJQUFJLEdBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RSxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQVJELG9CQVFDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEtBQWM7SUFDcEMsT0FBTyxPQUFPLEtBQUssS0FBSyxXQUFXLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQztBQUMxRCxDQUFDO0FBRkQsOEJBRUM7QUFFRCxTQUFnQixVQUFVLENBQW1CLElBQU8sRUFBRSxTQUFTLEdBQUcsS0FBSztJQUNuRSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQWtCLENBQUM7QUFDOUYsQ0FBQztBQUhELGdDQUdDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLElBQWtCO0lBQzNDLE9BQU8sSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRTtRQUNwQyxHQUFHLEVBQUUsU0FBUztRQUNkLEtBQUssRUFBRSxTQUFTO1FBQ2hCLElBQUksRUFBRSxTQUFTO1FBQ2YsUUFBUSxFQUFFLGtCQUFrQjtLQUMvQixDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQVBELG9DQU9DO0FBRUQsU0FBZ0IsaUJBQWlCLENBQUMsUUFBZ0I7SUFDOUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN4QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDaEUsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7U0FDbEIsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7VUFDdEIsR0FBRztVQUNILElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXpELE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3pELENBQUM7QUFWRCw4Q0FVQztBQUVELE1BQU0sa0JBQWtCLEdBQUcsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUVqRSxTQUFnQixjQUFjLENBQUMsSUFBYTtJQUN4QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ25ELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFKRCx3Q0FJQyJ9