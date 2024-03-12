const logPrefix = '[TGBot]';

export class Logger extends null {
    public static info(...args: unknown[]): void {
        console.log(logPrefix, ...args);
    }

    public static warn(...args: unknown[]): void {
        console.warn(logPrefix, ...args);
    }

    public static error(...args: unknown[]): void {
        console.error(logPrefix, ...args);
    }
}
