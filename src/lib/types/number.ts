import { Argument } from "../commands";
import { TelegramClient } from "../client";
import { isNullish } from "../util";
import { ArgumentTypeHandler, ArgumentType } from "./base";

// noinspection JSUnusedGlobalSymbols
export class NumberArgumentTypeHandler extends ArgumentTypeHandler<ArgumentType.Number> {
    public constructor(client: TelegramClient) {
        super(client, ArgumentType.Number);
    }

    public validate(value: string, _: unknown, argument: Argument<ArgumentType.Number>): boolean | string {
        const {
            choices,
            max,
            min,
        } = argument;
        if (isNaN(+value) || !/^\d+$/.test(value)) return false;
        const number = parseInt(value);

        if (choices && !choices.includes(number)) {
            return `Ingrese una de las siguientes opciones: ${choices.map(c => `\`${c}\``).join(", ")}`;
        }
        if (!isNullish(min) && number < min) {
            return `Ingrese un número mayor o igual a ${min}.`;
        }
        if (!isNullish(max) && number > max) {
            return `Ingrese un número menor o igual a ${max}.`;
        }

        return true;
    }

    public parse(value: string): number {
        return +value;
    }
}
