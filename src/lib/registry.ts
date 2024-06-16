import requireAll from "require-all";
import { TelegramClient } from "./client";
import { Collection } from "./collection";
import { Command, ConstructableCommand, parseContext } from "./commands";
import { ArgumentTypeHandler, ArgumentType, ConstructableArgumentType as BuildableArgumentTypeHandler } from "./types";
import { capitalize, isNullish } from "./util";
import { Logger } from "./logger";

type NodeModuleOf<T> = T | {
    [k: string]: T;
};

export class ClientRegistry {
    public readonly client: TelegramClient;
    public readonly commands: Collection<string, Command>;
    public readonly types: Omit<Collection<ArgumentType, ArgumentTypeHandler<ArgumentType>>, "get"> & {
        get<T extends ArgumentType>(type: T): ArgumentTypeHandler<T>;
    };

    public constructor(client: TelegramClient) {
        this.client = client;
        this.commands = new Collection();
        this.types = new Collection() as ClientRegistry["types"];
    }

    public registerCommandsIn(path: string, ...exclude: string[]): this {
        const commandsFolder: Record<string, NodeModuleOf<typeof Command>> = requireAll(path);
        const commands = Object.entries(commandsFolder)
            .filter(([fileName]) => !exclude.includes(fileName))
            .map(([fileName, commandModule]) => {
                if ("prototype" in commandModule && commandModule.prototype instanceof Command) {
                    return commandModule;
                }
                if ("default" in commandModule) {
                    return commandModule.default;
                }
                const mod = commandModule as Record<string, typeof Command>;
                return mod[`${capitalize(fileName)}Command`];
            })
            .filter((command): command is typeof Command => !isNullish(command));

        return this.registerCommands(commands as unknown as ConstructableCommand[]);
    }

    public registerTypeHandlersIn(path: string, ...exclude: string[]): this {
        const typeHandlersFolder: Record<string, NodeModuleOf<typeof ArgumentTypeHandler>> = requireAll(path);
        const typeHandlers = Object.entries(typeHandlersFolder)
            .filter(([fileName]) => !exclude.includes(fileName))
            .map(([fileName, typeHandlerModule]) => {
                if ("prototype" in typeHandlerModule && typeHandlerModule.prototype instanceof ArgumentTypeHandler) {
                    return typeHandlerModule;
                }
                if ("default" in typeHandlerModule) {
                    return typeHandlerModule.default;
                }
                const mod = typeHandlerModule as Record<string, typeof ArgumentTypeHandler>;
                return mod[`${capitalize(fileName)}ArgumentTypeHandler`];
            })
            .filter((type): type is typeof ArgumentTypeHandler => !isNullish(type));

        return this.registerTypeHandlers(typeHandlers as BuildableArgumentTypeHandler[]);
    }

    protected registerCommands(commands: ConstructableCommand[]): this {
        let registered = 0;
        for (const command of commands) {
            const isValid = command && command.prototype instanceof Command;
            if (!isValid) {
                Logger.warn(`Attempting to register an invalid command object: ${command}... skipping.`);
                continue;
            }

            this.registerCommand(command);
            registered++;
        }

        Logger.info("Registered", registered, "commands.");
        return this;
    }

    protected registerTypeHandlers(types: BuildableArgumentTypeHandler[]): this {
        let registered = 0;
        for (const type of types) {
            const isValid = type && type.prototype instanceof ArgumentTypeHandler;
            if (!isValid) {
                Logger.warn("warn", `Attempting to register an invalid argument type object: ${type}... skipping.`);
                continue;
            }

            this.registerTypeHandler(type);
            registered++;
        }

        Logger.info("Registered", registered, "type handlers.");
        return this;
    }

    protected registerCommand(NewCommand: ConstructableCommand): this {
        const {
            commands,
            client,
        } = this;
        const command = new NewCommand(client);
        const { name } = command;

        if (commands.has(name)) {
            Logger.warn(`A command with the name "${name}" is already registered. Skipping...`);
            return this;
        }

        commands.set(name, command);
        this.client.command(name, async (ctx, next) => {
            Logger.info(`Running ${ctx.text}`, ctx.args);

            const context = parseContext(ctx, client);
            const canRunHere = command.canRunHere(context);
            if (canRunHere !== true) {
                await context.fancyReply(canRunHere || "No se puede usar este comando aquí.");
                next();
                return;
            }

            const activeMenu = this.client.activeMenus.get(context.session);
            if (command.ensureInactiveMenus && activeMenu) {
                await context.fancyReply(`Ya tienes un menú activo para /${activeMenu}. Usa /cancel para cerrarlo.`);
                next();
                return;
            }

            const args = await command.parseArgs(context);
            if (!args.ok) {
                await context.fancyReply(args.message, {
                    "parse_mode": "MarkdownV2",
                });
                next();
                return;
            }

            await context.react("👍").catch(() => null);
            command.run(context, args.values);
            next();
        });
        return this;
    }

    protected registerTypeHandler(NewArgumentType: BuildableArgumentTypeHandler): this {
        const {
            types,
            client,
        } = this;
        const typeHandler = new NewArgumentType(client);
        const { type } = typeHandler;

        if (types.has(type)) {
            Logger.warn("warn", `An argument type handler with the type "${type}" is already registered. Skipping...`);
            return this;
        }

        types.set(type, typeHandler);
        return this;
    }
}
