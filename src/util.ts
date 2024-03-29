import { Markup } from 'telegraf';
import { ValuesOf } from './lib';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export const removeKeyboard = {
    'reply_markup': Markup.removeKeyboard().reply_markup,
} as const satisfies ExtraReplyMessage;

export function stripIndent(text: string): string {
    return text.trim().replace(/^[ \t]+/gm, '');
}

type StringKeysOf<T> = ValuesOf<{
    [K in keyof T]: T[K] extends string ? K : never;
}>;

export function alphabetically<T extends string>(ascending?: boolean): (a: T, b: T) => number;
export function alphabetically<T>(key: StringKeysOf<T>, ascending?: boolean): (a: T, b: T) => number;
export function alphabetically<T>(key?: StringKeysOf<T> | boolean, ascending = true): (a: T, b: T) => number {
    return (o1, o2) => {
        const isFirstArgAscending = typeof key === 'boolean' || typeof key === 'undefined';
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
    return Math.floor((date.getTime() - Date.now()) / daysMsConversionFactor);
}

export function daysUntilToString(days: number): string {
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days === 2) return 'Pasado mañana';
    if (days < 6) return `${days} días`;

    const weeks = Math.trunc(days / 7);
    const daysRest = days % 7;
    const weeksString = weeks > 0 ? pluralize('semana', weeks) : '';
    const daysString = daysRest > 0 ? pluralize('día', daysRest) : '';

    return `${weeksString} ${daysString}`.trim();
}

function pluralize(text: string, amount: number): string {
    return `${amount} ${text}` + (amount !== 1 ? 's' : '');
}
