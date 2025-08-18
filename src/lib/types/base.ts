import { TelegramClient } from "../client";
import { Argument, CommandContext } from "../commands";
import { Awaitable } from "../util";

export enum ArgumentType {
    Boolean = "booleano",
    Number = "número",
    String = "texto",
    Date = "fecha",
}

export interface ArgumentTypeMap {
    [ArgumentType.Boolean]: boolean;
    [ArgumentType.Number]: number;
    [ArgumentType.String]: string;
    [ArgumentType.Date]: Date;
}

export abstract class ArgumentTypeHandler<T extends ArgumentType> {
    public readonly client: TelegramClient;
    public readonly type: ArgumentType;

    protected constructor(client: TelegramClient, type: T) {
        this.client = client;
        this.type = type;
    }

    public abstract validate(
        value: string,
        context: CommandContext,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        argument: Argument<T, any>
    ): Awaitable<ArgumentTypeValidationResult>;

    public abstract parse(
        value: string,
        context: CommandContext,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        argument: Argument<T, any>
    ): Awaitable<ArgumentTypeMap[T]>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public isEmpty(value: string, _context: CommandContext, _argument: Argument<T, any>): boolean {
        return value.length === 0;
    }
}

export type ArgumentTypeValidationResult =
    | ArgumentTypeValidationResultOk
    | ArgumentTypeValidationResultError;

export type ArgumentTypeValidationResultOk = {
    ok: true;
};

export type ArgumentTypeValidationResultError = {
    ok: false;
    message?: string;
};

export type ConstructableArgumentType = new (client: TelegramClient) => ArgumentTypeHandler<ArgumentType>;
