"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdown = exports.alphabetically = exports.stripIndent = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLFNBQWdCLFdBQVcsQ0FBQyxJQUFZO0lBQ3BDLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUZELGtDQUVDO0FBUUQsU0FBZ0IsY0FBYyxDQUFJLEdBQStCLEVBQUUsU0FBUyxHQUFHLElBQUk7SUFDL0UsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUNkLE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxHQUFHLEtBQUssU0FBUyxJQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVcsQ0FBQztRQUNuRixNQUFNLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTdDLElBQUksbUJBQW1CO1lBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUM7UUFFakQsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUMsQ0FBQztBQUNOLENBQUM7QUFaRCx3Q0FZQztBQUVELE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RILE1BQU0sYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFdkYsU0FBZ0IsY0FBYyxDQUFDLElBQVk7SUFDdkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRkQsd0NBRUMifQ==