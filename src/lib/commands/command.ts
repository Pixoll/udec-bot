import { TelegramClient } from "../client";
import { ArgumentTypeMap } from "../types";
import { omit } from "../util";
import { Argument, ArgumentOptions, ArgumentResultError } from "./argument";
import { CommandContext } from "./context";

export type CommandOptions<Args extends readonly ArgumentOptions[] = readonly ArgumentOptions[]> = {
    readonly name: string;
    readonly description: string;
    readonly groupOnly?: boolean;
    readonly ensureInactiveMenus?: boolean;
} & (Args extends [] ? {
    readonly args?: Args;
} : {
    readonly args: Args;
});

export type AnyArguments = Record<string, unknown>;

export type ParseArgsResult = ParseArgsResultOk | ArgumentResultError;

export type ParseArgsResultOk = {
    ok: true;
    values: AnyArguments;
};

export type ArgumentOptionsToClasses<Args extends readonly ArgumentOptions[]>
    = Args extends [infer Arg extends ArgumentOptions, ...infer RestArgs extends readonly ArgumentOptions[]]
    | readonly [infer Arg extends ArgumentOptions, ...infer RestArgs extends readonly ArgumentOptions[]]
    ? [Argument<Arg["type"]>, ...ArgumentOptionsToClasses<RestArgs>]
    : [];

export type ArgumentOptionsToResult<Args extends readonly ArgumentOptions[]> = {
    [Arg in Args[number] as Arg["key"]]: (
    Arg["required"] extends true ? never
        : (
            Arg["default"] extends (...args: infer _) => infer R
                ? (Arg["infinite"] extends true ? Array<Awaited<R>> : Awaited<R>)
                : (Arg["default"] & null) extends never
                    ? (Arg["infinite"] extends true ? Array<Arg["default"]> : Arg["default"])
                    : (Arg["infinite"] extends true ? [] : null)
            )
    ) | (
    Arg["choices"] extends Array<infer U> | ReadonlyArray<infer U>
        ? (Arg["infinite"] extends true ? U[] : U)
        : (Arg["infinite"] extends true ? Array<ArgumentTypeMap[Arg["type"]]> : ArgumentTypeMap[Arg["type"]])
    );
};

export abstract class Command<Args extends readonly ArgumentOptions[] = []> {
    public readonly client: TelegramClient;
    public declare readonly name: string;
    public declare readonly description: string;
    public declare readonly groupOnly: boolean;
    public declare readonly ensureInactiveMenus: boolean;
    public declare readonly args: ArgumentOptionsToClasses<Args>;

    protected constructor(client: TelegramClient, options: CommandOptions<Args>) {
        this.client = client;
        Object.assign(this, omit(options, ["args"]));

        this.groupOnly ??= false;
        this.ensureInactiveMenus ??= false;

        const args: Argument[] = [];
        const argsOptions = options.args ?? [];
        let hasInfinite = false;

        for (let i = 0; i < argsOptions.length; i++) {
            const argOptions = argsOptions[i]!;

            if (argOptions.infinite) {
                if (hasInfinite) {
                    throw new Error("There cannot be multiple infinite arguments.");
                }

                if (i !== argsOptions.length - 1) {
                    throw new Error("Infinite arguments must be placed last in the list.");
                }

                hasInfinite = true;
            }

            args.push(new Argument(client, argOptions));
        }

        this.args = args as ArgumentOptionsToClasses<Args>;
    }

    public abstract run(context: CommandContext, args: AnyArguments): unknown;

    public canRunHere(context: CommandContext): string | boolean {
        if (this.groupOnly && context.chat.type === "private") {
            return "Este comando solo puede ser usado en chats grupales.";
        }

        return true;
    }

    public async parseArgs(context: CommandContext): Promise<ParseArgsResult> {
        if (!this.args) {
            return {
                ok: true,
                values: {},
            };
        }

        const args: AnyArguments = {};
        const argsStrings = context.args;
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i]!;
            const value = arg.infinite ? argsStrings.slice(i)
                : i === this.args.length - 1 ? argsStrings.slice(i).join(" ")
                    : argsStrings[i] ?? "";
            const result = typeof value === "string"
                ? await arg.obtain(value, context)
                : await arg.obtainInfinite(value, context);
            if (!result.ok) return result;

            args[arg.key] = result.value;
        }

        return {
            ok: true,
            values: args,
        };
    }
}

export type ConstructableCommand = new (client: TelegramClient) => Command;
