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
