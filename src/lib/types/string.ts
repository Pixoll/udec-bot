import { TelegramClient } from "../client";
import { Argument } from "../commands";
import { isNullish } from "../util";
import { ArgumentType, ArgumentTypeHandler, ArgumentTypeValidationResult } from "./base";

// noinspection JSUnusedGlobalSymbols
export class StringArgumentTypeHandler extends ArgumentTypeHandler<ArgumentType.String> {
    public constructor(client: TelegramClient) {
        super(client, ArgumentType.String);
    }

    public validate(value: string, _: unknown, argument: Argument<ArgumentType.String>): ArgumentTypeValidationResult {
        const { choices, max, min, key } = argument;

        if (choices && !choices.map(c => c.toLowerCase()).includes(value.toLowerCase())) {
            return {
                ok: false,
                message: `Ingrese una de las siguientes opciones: ${choices.map(c => `\`${c}\``).join(", ")}`,
            };
        }
        if (!isNullish(min) && value.length < min) {
            return {
                ok: false,
                message: `"${key}" debe tener al menos ${min} caracteres.`,
            };
        }
        if (!isNullish(max) && value.length > max) {
            return {
                ok: false,
                message: `${key} debe tener máximo ${max} caracteres.`,
            };
        }

        return { ok: true };
    }

    public parse(value: string): string {
        return value;
    }
}
