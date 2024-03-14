import { TelegramClient } from '../client';
import { Argument } from '../commands';
import { dateAtSantiago, dateToString, isNullish } from '../util';
import { ArgumentType, ArgumentTypeHandler } from './base';

const dateRegex = /^[0-3]?\d[/-][01]?\d(?:[/-]\d{4})?$/;

export class DateArgumentTypeHandler extends ArgumentTypeHandler<ArgumentType.Date> {
    public constructor(client: TelegramClient) {
        super(client, ArgumentType.Date);
    }

    public validate(value: string, _: unknown, argument: Argument<ArgumentType.Date>): string | boolean {
        const date = parseDate(value);
        if (!date) {
            return 'Ingrese una fecha válida. El formato es DD-MM-YYYY.';
        }

        const time = date.getTime();
        const { min, max } = argument;
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
    if (!dateRegex.test(input)) return null;
    const date = dateAtSantiago(input);
    if (isNaN(date.getTime())) return null;
    return date;
}
