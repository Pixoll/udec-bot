"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateAtSantiago = exports.getTimeZoneOffset = exports.dateToString = exports.capitalize = exports.isNullish = exports.omit = void 0;
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
function capitalize(text) {
    return (text[0].toUpperCase() + text.slice(1));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxTQUFnQixJQUFJLENBQXNDLEdBQU0sRUFBRSxPQUFZO0lBQzFFLHlFQUF5RTtJQUN6RSxNQUFNLEdBQUcsR0FBRyxFQUFPLENBQUM7SUFDcEIsTUFBTSxJQUFJLEdBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RSxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQVJELG9CQVFDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEtBQWM7SUFDcEMsT0FBTyxPQUFPLEtBQUssS0FBSyxXQUFXLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQztBQUMxRCxDQUFDO0FBRkQsOEJBRUM7QUFFRCxTQUFnQixVQUFVLENBQW1CLElBQU87SUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFrQixDQUFDO0FBQ3BFLENBQUM7QUFGRCxnQ0FFQztBQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFrQjtJQUMzQyxPQUFPLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUU7UUFDcEMsR0FBRyxFQUFFLFNBQVM7UUFDZCxLQUFLLEVBQUUsU0FBUztRQUNoQixJQUFJLEVBQUUsU0FBUztRQUNmLFFBQVEsRUFBRSxrQkFBa0I7S0FDL0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFQRCxvQ0FPQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLFFBQWdCO0lBQzlDLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDeEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ2hFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDO1NBQ2xCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1VBQ3RCLEdBQUc7VUFDSCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUV6RCxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUN6RCxDQUFDO0FBVkQsOENBVUM7QUFFRCxNQUFNLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFakUsU0FBZ0IsY0FBYyxDQUFDLElBQWE7SUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNuRCxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsT0FBTyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsa0JBQWtCLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBSkQsd0NBSUMifQ==