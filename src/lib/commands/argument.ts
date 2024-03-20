import { CommandContext } from './context';
import { TelegramClient } from '../client';
import { ArgumentTypeHandler, ArgumentType, ArgumentTypeMap } from '../types';
import { Awaitable, escapeMarkdown, omit } from '../util';

type ArgumentDefault<T extends ArgumentType> =
    | ArgumentTypeMap[T]
    | ((value: string, context: CommandContext, argument: Argument<T>) => Awaitable<ArgumentTypeMap[T]>);

export interface ArgumentOptions<T extends ArgumentType = ArgumentType> {
    readonly key: string;
    readonly label?: string | null;
    readonly prompt?: string | null;
    readonly type: T;
    readonly required?: boolean;
    readonly default?: ArgumentDefault<T> | null;
    readonly choices?: ReadonlyArray<ArgumentTypeMap[T]> | null;
    readonly min?: number | null;
    readonly max?: number | null;
    readonly futureDate?: boolean;
    readonly whenInvalid?: string | null;
    readonly example?: string | null;
    parse?(value: string, context: CommandContext, argument: Argument<T>): Awaitable<ArgumentTypeMap[T]>;
    validate?(value: string, context: CommandContext, argument: Argument<T>): Awaitable<boolean | string>;
    isEmpty?(value: string, context: CommandContext, argument: Argument<T>): boolean;
}

export type ArgumentResult<T extends ArgumentType> = ArgumentResultOk<T> | ArgumentResultError;

export enum ArgumentResultErrorType {
    Empty,
    Invalid,
}

export interface ArgumentResultOk<T extends ArgumentType> {
    ok: true;
    value: ArgumentTypeMap[T] | null;
}

export interface ArgumentResultError {
    ok: false;
    error: ArgumentResultErrorType;
    message: string;
}

const defaultOptions = {
    label: null,
    prompt: null,
    required: false,
    default: null,
    choices: null,
    min: null,
    max: null,
    futureDate: false,
    whenInvalid: null,
    example: null,
} as const satisfies Partial<ArgumentOptions>;

export class Argument<T extends ArgumentType = ArgumentType> implements Omit<ArgumentOptions<T>, 'type'> {
    public declare readonly key: string;
    public declare readonly label: string | null;
    public declare readonly prompt: string | null;
    public readonly typeHandler: ArgumentTypeHandler<T>;
    public declare readonly required: boolean;
    public declare readonly default: ArgumentDefault<T> | null;
    public declare readonly choices: ReadonlyArray<ArgumentTypeMap[T]> | null;
    public declare readonly min: number | null;
    public declare readonly max: number | null;
    public declare readonly futureDate: boolean;
    public declare readonly whenInvalid: string | null;
    public declare readonly example: string | null;
    public readonly parser: NonNullable<ArgumentOptions<T>['parse']> | null;
    public readonly validator: NonNullable<ArgumentOptions<T>['validate']> | null;
    public readonly emptyChecker: NonNullable<ArgumentOptions<T>['isEmpty']> | null;
    public readonly client: TelegramClient;

    public constructor(client: TelegramClient, options: ArgumentOptions<T>) {
        this.client = client;

        Object.assign(this, defaultOptions, omit(options, ['parse', 'validate', 'isEmpty']));

        this.parser = options.parse ?? null;
        this.validator = options.validate ?? null;
        this.emptyChecker = options.isEmpty ?? null;
        const argumentType = client.registry.types.get(options.type);
        if (!argumentType) {
            throw new Error(`Could not resolve argument type from id "${options.type}".`);
        }
        this.typeHandler = argumentType;
    }

    public async obtain(value: string, context: CommandContext): Promise<ArgumentResult<T>> {
        const { default: defaultValue, required, typeHandler, key, label, prompt, whenInvalid, example } = this;
        const name = label ?? key;
        const type = typeHandler.type;
        const empty = this.isEmpty(value, context);
        if (empty) {
            if (required) {
                return {
                    ok: false,
                    error: ArgumentResultErrorType.Empty,
                    message: (prompt ?? escapeMarkdown(`Ingrese el argumento "${name}" de tipo ${type}.`))
                        + (example ? `\n\n${example}` : ''),
                };
            }

            const resolvedValue = typeof defaultValue === 'function'
                ? await defaultValue(value, context, this)
                : defaultValue;
            return {
                ok: true,
                value: resolvedValue,
            };
        }

        const isValid = await this.validate(value, context);
        if (isValid !== true) {
            return {
                ok: false,
                error: ArgumentResultErrorType.Invalid,
                message: (whenInvalid ?? (isValid
                    ? escapeMarkdown(isValid)
                    : escapeMarkdown(`Argumento inválido, "${name}" debe ser de tipo ${type}.`)
                )) + (example ? `\n\n${example}` : ''),
            };
        }

        const resolvedValue = await this.parse(value, context);
        return {
            ok: true,
            value: resolvedValue,
        };
    }

    public async parse(value: string, context: CommandContext): Promise<ArgumentTypeMap[T]> {
        if (this.parser) return await this.parser(value, context, this);
        return await this.typeHandler.parse(value, context, this);
    }

    public async validate(value: string, context: CommandContext): Promise<boolean | string> {
        if (this.validator) return await this.validator(value, context, this);
        return await this.typeHandler.validate(value, context, this);
    }

    public isEmpty(value: string, context: CommandContext): boolean {
        if (this.emptyChecker) return this.emptyChecker(value, context, this);
        return this.typeHandler.isEmpty(value, context, this);
    }
}
