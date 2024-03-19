"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daysUntilToString = exports.getDaysUntil = exports.daysMsConversionFactor = exports.escapeMarkdown = exports.alphabetically = exports.stripIndent = exports.removeKeyboard = void 0;
const telegraf_1 = require("telegraf");
exports.removeKeyboard = {
    'reply_markup': telegraf_1.Markup.removeKeyboard().reply_markup,
};
function stripIndent(text) {
    return text.trim().replace(/^[ \t]+/gm, '');
}
exports.stripIndent = stripIndent;
function alphabetically(key, ascending = true) {
    return (o1, o2) => {
        const isFirstArgAscending = typeof key === 'boolean' || typeof key === 'undefined';
        const a = isFirstArgAscending ? o1 : o1[key];
        const b = isFirstArgAscending ? o2 : o2[key];
        if (isFirstArgAscending)
            ascending = key ?? true;
        if (a < b)
            return ascending ? -1 : 1;
        if (a > b)
            return ascending ? 1 : -1;
        return 0;
    };
}
exports.alphabetically = alphabetically;
const markdownCharacters = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
const markdownRegex = new RegExp(markdownCharacters.map(c => `\\${c}`).join('|'), 'g');
function escapeMarkdown(text) {
    return text.replace(markdownRegex, '\\$&');
}
exports.escapeMarkdown = escapeMarkdown;
exports.daysMsConversionFactor = 86_400_000;
function getDaysUntil(date) {
    return Math.floor((date.getTime() - Date.now()) / exports.daysMsConversionFactor);
}
exports.getDaysUntil = getDaysUntil;
function daysUntilToString(days) {
    if (days === 0)
        return 'Hoy';
    if (days === 1)
        return 'Mañana';
    if (days === 2)
        return 'Pasado mañana';
    if (days < 6)
        return `${days} días`;
    const weeks = days / 7;
    const daysRest = days % 7;
    const weeksString = weeks > 0 ? pluralize('semana', weeks) : '';
    const daysString = daysRest > 0 ? pluralize('día', daysRest) : '';
    return `${weeksString} ${daysString}`.trim();
}
exports.daysUntilToString = daysUntilToString;
function pluralize(text, amount) {
    return amount === 1 ? text : text + 's';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUFrQztBQUlyQixRQUFBLGNBQWMsR0FBRztJQUMxQixjQUFjLEVBQUUsaUJBQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxZQUFZO0NBQ2xCLENBQUM7QUFFdkMsU0FBZ0IsV0FBVyxDQUFDLElBQVk7SUFDcEMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBRkQsa0NBRUM7QUFRRCxTQUFnQixjQUFjLENBQUksR0FBK0IsRUFBRSxTQUFTLEdBQUcsSUFBSTtJQUMvRSxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ2QsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLEdBQUcsS0FBSyxTQUFTLElBQUksT0FBTyxHQUFHLEtBQUssV0FBVyxDQUFDO1FBQ25GLE1BQU0sQ0FBQyxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFN0MsSUFBSSxtQkFBbUI7WUFBRSxTQUFTLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQztRQUVqRCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQVpELHdDQVlDO0FBRUQsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEgsTUFBTSxhQUFhLEdBQUcsSUFBSSxNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUV2RixTQUFnQixjQUFjLENBQUMsSUFBWTtJQUN2QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFGRCx3Q0FFQztBQUVZLFFBQUEsc0JBQXNCLEdBQUcsVUFBVSxDQUFDO0FBRWpELFNBQWdCLFlBQVksQ0FBQyxJQUFVO0lBQ25DLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyw4QkFBc0IsQ0FBQyxDQUFDO0FBQzlFLENBQUM7QUFGRCxvQ0FFQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLElBQVk7SUFDMUMsSUFBSSxJQUFJLEtBQUssQ0FBQztRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQzdCLElBQUksSUFBSSxLQUFLLENBQUM7UUFBRSxPQUFPLFFBQVEsQ0FBQztJQUNoQyxJQUFJLElBQUksS0FBSyxDQUFDO1FBQUUsT0FBTyxlQUFlLENBQUM7SUFDdkMsSUFBSSxJQUFJLEdBQUcsQ0FBQztRQUFFLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQztJQUVwQyxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7SUFDMUIsTUFBTSxXQUFXLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ2hFLE1BQU0sVUFBVSxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVsRSxPQUFPLEdBQUcsV0FBVyxJQUFJLFVBQVUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2pELENBQUM7QUFaRCw4Q0FZQztBQUVELFNBQVMsU0FBUyxDQUFDLElBQVksRUFBRSxNQUFjO0lBQzNDLE9BQU8sTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQzVDLENBQUMifQ==