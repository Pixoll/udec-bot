export type Awaitable<T> = T | Promise<T>;
export type ValuesOf<T> = T[keyof T];

export function omit<T extends object, K extends keyof T>(obj: T, exclude: K[]): Omit<T, K> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const res = {} as T;
    const keys = (Object.keys(obj) as K[]).filter(k => !exclude.includes(k));
    for (const key of keys) {
        res[key] = obj[key];
    }
    return res;
}

export function isNullish(value: unknown): value is null | undefined {
    return typeof value === 'undefined' || value === null;
}

export function capitalize<S extends string>(text: S): Capitalize<S> {
    return (text[0].toUpperCase() + text.slice(1)) as Capitalize<S>;
}

export function dateToString(date?: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Santiago',
    }).format(date ?? new Date());
}

export function getTimeZoneOffset(timeZone: string): number {
    const date = new Date();
    const iso = date.toLocaleString('en-CA', { timeZone, hour12: false })
        .replace(', ', 'T')
        .replace('T24:', 'T00:')
        + '.'
        + date.getMilliseconds().toString().padStart(3, '0');

    const lie = new Date(iso);
    return -(lie.getTime() - date.getTime()) / 60 / 1000;
}

const santiagoDateOffset = getTimeZoneOffset('America/Santiago');

export function dateAtSantiago(date?: string): Date {
    const dateObj = date ? new Date(date) : new Date();
    const ms = dateObj.getTime();
    return new Date(ms + santiagoDateOffset);
}
