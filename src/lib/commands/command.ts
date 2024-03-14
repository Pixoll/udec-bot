import { TelegramClient } from '../client';
import { ArgumentType, ArgumentTypeMap } from '../types';
import { omit } from '../util';
import { Argument, ArgumentOptions, ArgumentResultError } from './argument';
import { CommandContext } from './context';

export type CommandOptions<Args extends readonly ArgumentOptions[] = readonly ArgumentOptions[]> = {
    readonly name: string;
    readonly description: string;
    readonly groupOnly?: boolean;
} & (Args extends [] ? {
    readonly args?: Args;
} : {
    readonly args: Args;
});

export type AnyArguments = Record<string, unknown>;

export type ParseArgsResult = ParseArgsResultOk | ArgumentResultError;

export interface ParseArgsResultOk {
    ok: true;
    values: AnyArguments;
}

export type ArgumentOptionsToClasses<Args extends readonly ArgumentOptions[]>
    = Args extends [infer Arg extends ArgumentOptions, ...infer RestArgs extends readonly ArgumentOptions[]]
    | readonly [infer Arg extends ArgumentOptions, ...infer RestArgs extends readonly ArgumentOptions[]]
    ? [Argument<Arg['type']>, ...ArgumentOptionsToClasses<RestArgs>]
    : [];

export type ArgumentOptionsToResult<Args extends readonly ArgumentOptions[]> = {
    [Arg in Args[number]as Arg['key']]: (
        Arg['required'] extends true ? never : null
    ) | (
        Arg['default'] extends unknown ? never
        : Arg['default'] extends (...args: infer A) => infer R
        ? Awaited<R>
        : Arg['default']
    ) | (
        Arg['choices'] extends Array<infer U> | ReadonlyArray<infer U>
        ? U
        : ArgumentTypeMap[Arg['type']]
    );
};

export abstract class Command<Args extends readonly ArgumentOptions[] = []> {
    public readonly client: TelegramClient;
    public declare readonly name: string;
    public declare readonly description: string;
    public declare readonly groupOnly: boolean;
    public declare readonly args: ArgumentOptionsToClasses<Args>;

    protected constructor(client: TelegramClient, options: CommandOptions<Args>) {
        this.client = client;
        Object.assign(this, omit(options, ['args']));

        this.groupOnly ??= false;
        this.args = (options.args?.map(arg => new Argument(client, arg)) ?? []) as ArgumentOptionsToClasses<Args>;
    }

    public abstract run(context: CommandContext, args: AnyArguments): unknown;

    public canRunHere(context: CommandContext): boolean {
        return this.groupOnly && context.chat.type !== 'private';
    }

    public async parseArgs(context: CommandContext): Promise<ParseArgsResult> {
        if (!this.args) {
            return {
                ok: true,
                values: {},
            };
        }

        const { text } = context.message;
        const args: AnyArguments = {};
        const argsStrings = text.replace(/\/\w+ ?/, '').split(/ +/g);
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i] as Argument<ArgumentType>;
            const value = i === this.args.length - 1 ? argsStrings.slice(i).join(' ') : argsStrings[i];
            // eslint-disable-next-line no-await-in-loop
            const result = await arg.obtain(value, context);
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
