import { TelegramClient } from '../client';
import { ArgumentTypeHandler, ArgumentType } from './base';

const truthy: ReadonlySet<string> = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
const falsy: ReadonlySet<string> = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);

export class BooleanArgumentTypeHandler extends ArgumentTypeHandler<ArgumentType.Boolean> {
    public constructor(client: TelegramClient) {
        super(client, ArgumentType.Boolean);
    }

    public validate(value: string): boolean {
        const lc = value.toLowerCase();
        return truthy.has(lc) || falsy.has(lc);
    }

    public parse(value: string): boolean {
        const lc = value.toLowerCase();
        if (truthy.has(lc)) return true;
        if (falsy.has(lc)) return false;
        throw new RangeError('Unknown boolean value.');
    }
}
