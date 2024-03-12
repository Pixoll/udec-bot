"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRegistry = void 0;
const require_all_1 = __importDefault(require("require-all"));
const collection_1 = require("./collection");
const commands_1 = require("./commands");
const types_1 = require("./types");
const util_1 = require("./util");
class ClientRegistry {
    client;
    commands;
    types;
    constructor(client) {
        this.client = client;
        this.commands = new collection_1.Collection();
        this.types = new collection_1.Collection();
    }
    registerCommandsIn(path, ...exclude) {
        const commandsFolder = (0, require_all_1.default)(path);
        const commands = Object.entries(commandsFolder)
            .filter(([fileName]) => !exclude.includes(fileName))
            .map(([fileName, commandModule]) => 'prototype' in commandModule && commandModule.prototype instanceof commands_1.Command
            ? commandModule
            : 'default' in commandModule ? commandModule.default
                : commandModule[`${(0, util_1.capitalize)(fileName)}Command`])
            .filter((command) => !(0, util_1.isNullish)(command));
        return this.registerCommands(commands);
    }
    registerTypeHandlersIn(path, ...exclude) {
        const typesFolder = (0, require_all_1.default)(path);
        const types = Object.entries(typesFolder)
            .filter(([fileName]) => !exclude.includes(fileName))
            .map(([fileName, typeModule]) => 'prototype' in typeModule && typeModule.prototype instanceof types_1.ArgumentTypeHandler
            ? typeModule
            : 'default' in typeModule ? typeModule.default
                : typeModule[`${(0, util_1.capitalize)(fileName)}ArgumentType`])
            .filter((type) => !(0, util_1.isNullish)(type));
        return this.registerTypeHandlers(types);
    }
    registerCommands(commands) {
        let registered = 0;
        for (const command of commands) {
            const isValid = command && command.prototype instanceof commands_1.Command;
            if (!isValid) {
                console.warn(`Attempting to register an invalid command object: ${command}... skipping.`);
                continue;
            }
            this.registerCommand(command);
            registered++;
        }
        console.log('Registered', registered, 'commands.');
        return this;
    }
    registerTypeHandlers(types) {
        let registered = 0;
        for (const type of types) {
            const isValid = type && type.prototype instanceof types_1.ArgumentTypeHandler;
            if (!isValid) {
                console.warn('warn', `Attempting to register an invalid argument type object: ${type}... skipping.`);
                continue;
            }
            this.registerTypeHandler(type);
            registered++;
        }
        console.log('Registered', registered, 'type handlers.');
        return this;
    }
    registerCommand(NewCommand) {
        const { commands, client } = this;
        const command = new NewCommand(client);
        const { name } = command;
        if (commands.has(name)) {
            console.warn(`A command with the name "${name}" is already registered. Skipping...`);
            return this;
        }
        commands.set(name, command);
        this.client.command(name, async (ctx, next) => {
            const context = (0, commands_1.parseContext)(ctx, command);
            const args = await command.parseArgs(context);
            if (!args.ok) {
                await context.fancyReply(args.message);
                next();
                return;
            }
            command.run(context, args.values);
            next();
        });
        return this;
    }
    registerTypeHandler(NewArgumentType) {
        const { types, client } = this;
        const typeHandler = new NewArgumentType(client);
        const { type } = typeHandler;
        if (types.has(type)) {
            console.warn('warn', `An argument type handler with the type "${type}" is already registered. Skipping...`);
            return this;
        }
        types.set(type, typeHandler);
        return this;
    }
}
exports.ClientRegistry = ClientRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDhEQUFxQztBQUVyQyw2Q0FBMEM7QUFDMUMseUNBQXFFO0FBQ3JFLG1DQUFtSDtBQUNuSCxpQ0FBK0M7QUFNL0MsTUFBYSxjQUFjO0lBQ1AsTUFBTSxDQUFpQjtJQUN2QixRQUFRLENBQThCO0lBQ3RDLEtBQUssQ0FFbkI7SUFFRixZQUFtQixNQUFzQjtRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSx1QkFBVSxFQUE2QixDQUFDO0lBQzdELENBQUM7SUFFTSxrQkFBa0IsQ0FBQyxJQUFZLEVBQUUsR0FBRyxPQUFpQjtRQUN4RCxNQUFNLGNBQWMsR0FBaUQsSUFBQSxxQkFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO2FBQzFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNuRCxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsRUFBRSxFQUFFLENBQy9CLFdBQVcsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLFNBQVMsWUFBWSxrQkFBTztZQUN0RSxDQUFDLENBQUMsYUFBYTtZQUNmLENBQUMsQ0FBQyxTQUFTLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTztnQkFDaEQsQ0FBQyxDQUFFLGFBQWdELENBQUMsR0FBRyxJQUFBLGlCQUFVLEVBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxD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