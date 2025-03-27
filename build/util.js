"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearOldAssignments = exports.getSubjects = exports.dateStringToSqlDate = exports.daysUntilToString = exports.getDaysUntil = exports.daysMsConversionFactor = exports.alphabetically = exports.stripIndent = exports.removeKeyboard = void 0;
const telegraf_1 = require("telegraf");
const lib_1 = require("./lib");
exports.removeKeyboard = {
    "reply_markup": telegraf_1.Markup.removeKeyboard().reply_markup,
};
function stripIndent(text) {
    return text.trim().replace(/^[ \t]+/gm, "");
}
exports.stripIndent = stripIndent;
function alphabetically(key, ascending = true) {
    return (o1, o2) => {
        const isFirstArgAscending = typeof key === "boolean" || typeof key === "undefined";
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
exports.daysMsConversionFactor = 86_400_000;
function getDaysUntil(date) {
    return Math.ceil((date.getTime() - Date.now()) / exports.daysMsConversionFactor);
}
exports.getDaysUntil = getDaysUntil;
function daysUntilToString(days) {
    if (days === 0)
        return "Hoy";
    if (days === 1)
        return "Mañana";
    if (days === 2)
        return "Pasado mañana";
    if (days < 6)
        return `${days} días`;
    const weeks = Math.trunc(days / 7);
    const daysRest = days % 7;
    const weeksString = weeks > 0 ? pluralize("semana", weeks) : "";
    const daysString = daysRest > 0 ? pluralize("día", daysRest) : "";
    return `${weeksString} ${daysString}`.trim();
}
exports.daysUntilToString = daysUntilToString;
function dateStringToSqlDate(date) {
    return date.split("/").reverse().join("-");
}
exports.dateStringToSqlDate = dateStringToSqlDate;
function pluralize(text, amount) {
    return `${amount} ${text}` + (amount !== 1 ? "s" : "");
}
async function getSubjects(client, context) {
    return client.db
        .selectFrom("udec_chat_subject as chat_subject")
        .innerJoin("udec_subject as subject", "chat_subject.subject_code", "subject.code")
        .select(["subject.code", "subject.name", "subject.credits"])
        .where("chat_subject.chat_id", "=", `${context.chat.id}`)
        .execute();
}
exports.getSubjects = getSubjects;
async function clearOldAssignments(client) {
    const expired = await client.db
        .selectFrom("udec_assignment")
        .selectAll()
        .where("date_due", "<", dateStringToSqlDate((0, lib_1.dateToString)()))
        .execute();
    if (expired.length > 0) {
        await client.db
            .deleteFrom("udec_assignment")
            .where("id", "in", expired.map(a => a.id))
            .execute();
        lib_1.Logger.info("Deleted assignments:", expired);
    }
}
exports.clearOldAssignments = clearOldAssignments;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUFrQztBQUVsQywrQkFBdUU7QUFJMUQsUUFBQSxjQUFjLEdBQUc7SUFDMUIsY0FBYyxFQUFFLGlCQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsWUFBWTtDQUNsQixDQUFDO0FBRXZDLFNBQWdCLFdBQVcsQ0FBQyxJQUFZO0lBQ3BDLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUZELGtDQUVDO0FBUUQsU0FBZ0IsY0FBYyxDQUFJLEdBQStCLEVBQUUsU0FBUyxHQUFHLElBQUk7SUFDL0UsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUNkLE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxHQUFHLEtBQUssU0FBUyxJQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVcsQ0FBQztRQUNuRixNQUFNLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTdDLElBQUksbUJBQW1CO1lBQUUsU0FBUyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUM7UUFFakQsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNy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