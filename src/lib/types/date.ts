import { TelegramClient } from "../client";
import { Argument } from "../commands";
import { dateAtSantiago, dateToString, isNullish } from "../util";
import { ArgumentType, ArgumentTypeHandler } from "./base";

const dateRegex = /^[0-3]?\d[/-][01]?\d((?:[/-]\d{4}))?$/;

export class DateArgumentTypeHandler extends ArgumentTypeHandler<ArgumentType.Date> {
    public constructor(client: TelegramClient) {
        super(client, ArgumentType.Date);
    }

    public validate(value: string, _: unknown, argument: Argument<ArgumentType.Date>): string | boolean {
        const date = parseDate(value);
        if (!date) {
            return "Ingrese una fecha válida. El formato es DD-MM o DD-MM-YYYY.";
        }

        const time = date.getTime();
        const { min, max, futureDate } = argument;
        if (futureDate && time < Date.now()) {
            return "Ingrese una fecha en el futuro.";
        }
        if (!isNullish(min) && time < min) {
            return `Ingrese una fecha mayor o igual a ${dateToString(new Date(min))}.`;
        }
        if (!isNullish(max) && time > max) {
            return `Ingrese una fecha menor o igual a ${dateToString(new Date(max))}.`;
        }

        return true;
    }

    public parse(value: string): Date {
        return parseDate(value) as Date;
    }
}

function parseDate(input: string): Date | null {
    const match = input.match(dateRegex);
    if (!match) return null;
    if (!match[1]) {
        input = input + "/" + dateAtSantiago().getFullYear();
    }

    const parsedInput = input.replace(/-/g, "/").split("/").reverse().join("/");
    const date = dateAtSantiago(parsedInput);
    return isNaN(date.getTime()) ? null : date;
}
