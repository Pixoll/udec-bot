import { Markup } from "telegraf";
import { client, TelegramClientType } from "./client";
import { CommandContext, dateToString, Logger, ValuesOf } from "./lib";
import { Subject } from "./tables";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

export const removeKeyboard = {
    "reply_markup": Markup.removeKeyboard().reply_markup,
} as const satisfies ExtraReplyMessage;

export function stripIndent(text: string): string {
    return text.trim().replace(/^[ \t]+/gm, "");
}

type StringKeysOf<T> = ValuesOf<{
    [K in keyof T]: T[K] extends string ? K : never;
}>;

export function alphabetically<T extends string>(ascending?: boolean): (a: T, b: T) => number;
export function alphabetically<T>(key: StringKeysOf<T>, ascending?: boolean): (a: T, b: T) => number;
export function alphabetically<T>(key?: StringKeysOf<T> | boolean, ascending = true): (a: T, b: T) => number {
    return (o1, o2) => {
        const isFirstArgAscending = typeof key === "boolean" || typeof key === "undefined";
        const a = isFirstArgAscending ? o1 : o1[key];
        const b = isFirstArgAscending ? o2 : o2[key];

        if (isFirstArgAscending) ascending = key ?? true;

        if (a < b) return ascending ? -1 : 1;
        if (a > b) return ascending ? 1 : -1;
        return 0;
    };
}

export const daysMsConversionFactor = 86_400_000;

export function getDaysUntil(date: Date): number {
    return Math.ceil((date.getTime() - Date.now()) / daysMsConversionFactor);
}

export function daysUntilToString(days: number): string {
    if (days === 0) return "Hoy";
    if (days === 1) return "Mañana";
    if (days === 2) return "Pasado mañana";
    if (days < 6) return `${days} días`;

    const weeks = Math.trunc(days / 7);
    const daysRest = days % 7;
    const weeksString = weeks > 0 ? pluralize("semana", weeks) : "";
    const daysString = daysRest > 0 ? pluralize("día", daysRest) : "";

    return `${weeksString} ${daysString}`.trim();
}

export function dateStringToSqlDate(date: string): string {
    return date.split("/").reverse().join("-");
}

function pluralize(text: string, amount: number): string {
    return `${amount} ${text}` + (amount !== 1 ? "s" : "");
}

export async function getSubjects(client: TelegramClientType, context: CommandContext): Promise<Subject[]> {
    return client.db
        .selectFrom("udec_chat_subject as chat_subject")
        .innerJoin("udec_subject as subject", "chat_subject.subject_code", "subject.code")
        .select(["subject.code", "subject.name", "subject.credits"])
        .where("chat_subject.chat_id", "=", `${context.chat.id}`)
        .execute();
}

export async function clearOldAssignments(client: TelegramClientType): Promise<void> {
    const expired = await client.db
        .selectFrom("udec_assignment")
        .selectAll()
        .where("date_due", "<", dateStringToSqlDate(dateToString()))
        .execute();

    if (expired.length > 0) {
        await client.db
            .deleteFrom("udec_assignment")
            .where("id", "in", expired.map(a => a.id))
            .execute();

        Logger.info("Deleted assignments:", expired);
    }
}
