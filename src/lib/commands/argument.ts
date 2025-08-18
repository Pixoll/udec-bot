import { TelegramClient } from "../client";
import { ArgumentType, ArgumentTypeHandler, ArgumentTypeMap, ArgumentTypeValidationResult } from "../types";
import { Awaitable, escapeMarkdown, omit } from "../util";
import { CommandContext } from "./context";

type ArgumentDefault<T extends ArgumentType, V> =
    | ArgumentTypeMap[T]
    | ((value: string, context: CommandContext, argument: Argument<T, V>) => Awaitable<ArgumentTypeMap[T]>);

export interface ArgumentOptions<T extends ArgumentType = ArgumentType, V = ArgumentTypeMap[T]> {
    readonly key: string;
    readonly label?: string | null;
    readonly prompt?: string | null;
    readonly type: T;
    readonly required?: boolean;
    readonly default?: ArgumentDefault<T, V> | null;
    readonly choices?: ReadonlyArray<ArgumentTypeMap[T]> | null;
    readonly min?: number | null;
    readonly max?: number | null;
    readonly futureDate?: boolean;
    readonly whenInvalid?: string | null;
    readonly examples?: string[];
    readonly infinite?: boolean;

    parse?(value: string, context: CommandContext, argument: Argument<T, V>): Awaitable<ArgumentTypeMap[T] | V>;

    validate?(value: string, context: CommandContext, argument: Argument<T, V>): Awaitable<ArgumentTypeValidationResult>;

    isEmpty?(value: string, context: CommandContext, argument: Argument<T, V>): boolean;
}

export type ArgumentResult<T extends ArgumentType, V, Infinite extends boolean = false> =
    | ArgumentResultOk<T, V, Infinite>
    | ArgumentResultError;

export enum ArgumentResultErrorType {
    Empty,
    Invalid,
}

export type ArgumentResultOk<T extends ArgumentType, V, Infinite extends boolean> = {
    ok: true;
    value: Infinite extends true ? Array<ArgumentTypeMap[T] | V> : ArgumentTypeMap[T] | V | null;
};

export type ArgumentResultError = {
    ok: false;
    error: ArgumentResultErrorType;
    message: string;
};

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
    examples: [],
    infinite: false,
} as const satisfies Partial<ArgumentOptions>;

export class Argument<T extends ArgumentType = ArgumentType, V = ArgumentTypeMap[T]> // eslint-disable-next-line
    implements Omit<ArgumentOptions<T, V>, "type"> {
    public declare readonly key: string;
    public declare readonly label: string | null;
    public declare readonly prompt: string | null;
    public readonly typeHandler: ArgumentTypeHandler<T>;
    public declare readonly required: boolean;
    public declare readonly default: ArgumentDefault<T, V> | null;
    public declare readonly choices: ReadonlyArray<ArgumentTypeMap[T]> | null;
    public declare readonly min: number | null;
    public declare readonly max: number | null;
    public declare readonly futureDate: boolean;
    public declare readonly whenInvalid: string | null;
    public declare readonly examples: string[];
    public declare readonly infinite: boolean;
    public readonly parser: NonNullable<ArgumentOptions<T, V>["parse"]> | null;
    public readonly validator: NonNullable<ArgumentOptions<T, V>["validate"]> | null;
    public readonly emptyChecker: NonNullable<ArgumentOptions<T, V>["isEmpty"]> | null;
    public readonly client: TelegramClient;

    public constructor(client: TelegramClient, options: ArgumentOptions<T, V>) {
        this.client = client;

        Object.assign(this, defaultOptions, omit(options, ["parse", "validate", "isEmpty"]));

        this.parser = options.parse ?? null;
        this.validator = options.validate ?? null;
        this.emptyChecker = options.isEmpty ?? null;
        const argumentType = client.registry.types.get(options.type);
        if (!argumentType) {
            throw new Error(`Could not resolve argument type from id "${options.type}".`);
        }
        this.typeHandler = argumentType;
    }

    public async obtain(value: string, context: CommandContext): Promise<ArgumentResult<T, V>> {
        const {
            default: defaultValue,
            required,
            typeHandler,
            key,
            label,
            prompt,
            whenInvalid,
            examples,
        } = this;

        const name = label ?? key;
        const type = typeHandler.type;
        const empty = this.isEmpty(value, context);
        const parsedExamples = examples.length > 0
            ? escapeMarkdown(`\n\nEjemplos: ${examples.map(e => `\`${e}\``).join(", ")}.`, "`")
            : "";

        if (empty) {
            if (required) {
                return {
                    ok: false,
                    error: ArgumentResultErrorType.Empty,
                    message: escapeMarkdown(prompt ?? `Ingrese el argumento "${name}" de tipo ${type}.`) + parsedExamples,
                };
            }

            const resolvedValue = typeof defaultValue === "function"
                ? await defaultValue(value, context, this)
                : defaultValue;
            return {
                ok: true,
                value: resolvedValue,
            };
        }

        const validationResult = await this.validate(value, context);
        if (!validationResult.ok) {
            return {
                ok: false,
                error: ArgumentResultErrorType.Invalid,
                message: escapeMarkdown(whenInvalid
                    ?? validationResult.message
                    ?? `Argumento inválido, "${name}" debe ser de tipo ${type}.`
                ) + parsedExamples,
            };
        }

        const resolvedValue = await this.parse(value, context);
        return {
            ok: true,
            value: resolvedValue,
        };
    }

    public async obtainInfinite(values: string[], context: CommandContext): Promise<ArgumentResult<T, V, true>> {
        const {
            default: defaultValue,
            required,
            typeHandler,
            key,
            label,
            prompt,
            whenInvalid,
            examples,
        } = this;

        const name = label ?? key;
        const type = typeHandler.type;
        const empty = this.isEmpty(values.join("").replace(/\s+/g, ""), context);
        const parsedExamples = examples.length > 0
            ? escapeMarkdown(`\n\nEjemplos: ${examples.map(e => `\`${e}\``).join(", ")}.`, "`")
            : "";

        if (empty) {
            if (required) {
                return {
                    ok: false,
                    error: ArgumentResultErrorType.Empty,
                    message: escapeMarkdown(prompt ?? `Ingrese el argumento "${name}" de tipo ${type}.`) + parsedExamples,
                };
            }

            const resolvedValue = typeof defaultValue === "function"
                ? await defaultValue(values.join(" "), context, this)
                : defaultValue;
            return {
                ok: true,
                value: resolvedValue !== null ? [resolvedValue] : [],
            };
        }

        for (let i = 0; i < values.length; i++) {
            const value = values[i]!;
            const validationResult = await this.validate(value, context);
            if (!validationResult.ok) {
                return {
                    ok: false,
                    error: ArgumentResultErrorType.Invalid,
                    message: escapeMarkdown(whenInvalid
                        ?? validationResult.message
                        ?? `Argumento ${i + 1} inválido, "${name}" debe ser de tipo ${type}.`
                    ) + parsedExamples,
                };
            }
        }

        const resolvedValues = await Promise.all(values.map(value => this.parse(value, context)));
        return {
            ok: true,
            value: resolvedValues,
        };
    }

    public async parse(value: string, context: CommandContext): Promise<ArgumentTypeMap[T] | V> {
        if (this.parser) return this.parser(value, context, this);
        return this.typeHandler.parse(value, context, this);
    }

    public async validate(value: string, context: CommandContext): Promise<ArgumentTypeValidationResult> {
        if (this.validator) return this.validator(value, context, this);
        return this.typeHandler.validate(value, context, this);
    }

    public isEmpty(value: string, context: CommandContext): boolean {
        if (this.emptyChecker) return this.emptyChecker(value, context, this);
        return this.typeHandler.isEmpty(value, context, this);
    }
}
