const logPrefix = "[TGBot]";

export const Logger = {
    info(...args: unknown[]): void {
        console.log(logPrefix, ...args);
    },
    warn(...args: unknown[]): void {
        console.warn(logPrefix, ...args);
    },
    error(...args: unknown[]): void {
        console.error(logPrefix, ...args);
    },
} as const;
