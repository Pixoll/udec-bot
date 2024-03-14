import { Argument } from '../commands/argument';
import { TelegramClient } from '../client';
import { CommandContext } from '../commands/context';
import { Awaitable } from '../util';

export enum ArgumentType {
    Boolean = 'booleano',
    Number = 'número',
    String = 'texto',
    Date = 'fecha',
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

    public constructor(client: TelegramClient, type: T) {
        this.client = client;
        this.type = type;
    }

    public abstract validate(value: string, context: CommandContext, argument: Argument<T>): Awaitable<boolean | string>;

    public abstract parse(value: string, context: CommandContext, argument: Argument<T>): Awaitable<ArgumentTypeMap[T]>;

    public isEmpty(value: string, _context: CommandContext, _argument: Argument<T>): boolean {
        return value.length === 0;
    }
}

export type ConstructableArgumentType = new (client: TelegramClient) => ArgumentTypeHandler<ArgumentType>;
