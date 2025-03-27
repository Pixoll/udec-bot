import { TelegramClient } from "../client";
import { Argument } from "../commands";
import { isNullish } from "../util";
import { ArgumentType, ArgumentTypeHandler, ArgumentTypeValidationResult } from "./base";

// noinspection JSUnusedGlobalSymbols
export class NumberArgumentTypeHandler extends ArgumentTypeHandler<ArgumentType.Number> {
    public constructor(client: TelegramClient) {
        super(client, ArgumentType.Number);
    }

    public validate(value: string, _: unknown, argument: Argument<ArgumentType.Number>): ArgumentTypeValidationResult {
        const { choices, max, min } = argument;
        if (!Number.isSafeInteger(+value)) return { ok: false };

        const number = +value;

        if (choices && !choices.includes(number)) {
            return {
                ok: false,
                message: `Ingrese una de las siguientes opciones: ${choices.map(c => `\`${c}\``).join(", ")}`,
            };
        }
        if (!isNullish(min) && number < min) {
            return {
                ok: false,
                message: `Ingrese un número mayor o igual a ${min}.`,
            };
        }
        if (!isNullish(max) && number > max) {
            return {
                ok: false,
                message: `Ingrese un número menor o igual a ${max}.`,
            };
        }

        return { ok: true };
    }

    public parse(value: string): number {
        return +value;
    }
}
