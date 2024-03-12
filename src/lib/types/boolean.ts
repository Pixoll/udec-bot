import { TelegramClient } from '../client';
import { ArgumentTypeHandler, ArgumentType } from './base';

export class BooleanArgumentType extends ArgumentTypeHandler<ArgumentType.Boolean> {
    protected truthy: ReadonlySet<string>;
    protected falsy: ReadonlySet<string>;

    public constructor(client: TelegramClient) {
        super(client, ArgumentType.Boolean);
        this.truthy = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
        this.falsy = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);
    }

    public validate(value: string): boolean {
        const lc = value.toLowerCase();
        return this.truthy.has(lc) || this.falsy.has(lc);
    }

    public parse(value: string): boolean {
        const lc = value.toLowerCase();
        if (this.truthy.has(lc)) return true;
        if (this.falsy.has(lc)) return false;
        throw new RangeError('Unknown boolean value.');
    }
}
