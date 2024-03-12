import { Argument } from '../commands/argument';
import { TelegramClient } from '../client';
import { isNullish } from '../util';
import { ArgumentType, ArgumentTypeHandler } from './base';

export default class StringArgumentType extends ArgumentTypeHandler<ArgumentType.String> {
    public constructor(client: TelegramClient) {
        super(client, ArgumentType.String);
    }

    public validate(value: string, _: unknown, argument: Argument<ArgumentType.String>): boolean | string {
        const { choices, max, min, key } = argument;
        if (choices && !choices.map(c => c.toLowerCase()).includes(value.toLowerCase())) {
            return `Ingrese una de las siguientes opciones: ${choices.map(c => `\`${c}\``).join(', ')}`;
        }
        if (!isNullish(min) && value.length < min) {
            return `"${key}" debe tener al menos ${min} caracteres.`;
        }
        if (!isNullish(max) && value.length > max) {
            return `${key} debe tener máximo ${max} caracteres.`;
        }
        return true;
    }

    public parse(value: string): string {
        return value;
    }
}
