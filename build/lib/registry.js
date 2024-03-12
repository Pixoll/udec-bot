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
const logger_1 = require("./logger");
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
                logger_1.Logger.warn(`Attempting to register an invalid command object: ${command}... skipping.`);
                continue;
            }
            this.registerCommand(command);
            registered++;
        }
        logger_1.Logger.info('Registered', registered, 'commands.');
        return this;
    }
    registerTypeHandlers(types) {
        let registered = 0;
        for (const type of types) {
            const isValid = type && type.prototype instanceof types_1.ArgumentTypeHandler;
            if (!isValid) {
                logger_1.Logger.warn('warn', `Attempting to register an invalid argument type object: ${type}... skipping.`);
                continue;
            }
            this.registerTypeHandler(type);
            registered++;
        }
        logger_1.Logger.info('Registered', registered, 'type handlers.');
        return this;
    }
    registerCommand(NewCommand) {
        const { commands, client } = this;
        const command = new NewCommand(client);
        const { name } = command;
        if (commands.has(name)) {
            logger_1.Logger.warn(`A command with the name "${name}" is already registered. Skipping...`);
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
            logger_1.Logger.warn('warn', `An argument type handler with the type "${type}" is already registered. Skipping...`);
            return this;
        }
        types.set(type, typeHandler);
        return this;
    }
}
exports.ClientRegistry = ClientRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDhEQUFxQztBQUVyQyw2Q0FBMEM7QUFDMUMseUNBQXFFO0FBQ3JFLG1DQUFtSDtBQUNuSCxpQ0FBK0M7QUFDL0MscUNBQWtDO0FBTWxDLE1BQWEsY0FBYztJQUNQLE1BQU0sQ0FBaUI7SUFDdkIsUUFBUSxDQUE4QjtJQUN0QyxLQUFLLENBRW5CO0lBRUYsWUFBbUIsTUFBc0I7UUFDckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksdUJBQVUsRUFBNkIsQ0FBQztJQUM3RCxDQUFDO0lBRU0sa0JBQWtCLENBQUMsSUFBWSxFQUFFLEdBQUcsT0FBaUI7UUFDeEQsTUFBTSxjQUFjLEdBQWlELElBQUEscUJBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUN0RixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQzthQUMxQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxDQUMvQixXQUFXLElBQUksYUFBYSxJQUFJLGFBQWEsQ0FBQyxTQUFTLFlBQVksa0JBQU87WUFDdEUsQ0FBQyxDQUFDLGFBQWE7WUFDZixDQUFDLENBQUMsU0FBUyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU87Z0JBQ2hELENBQUMsQ0FBRSxhQUFnRCxDQUFDLEdBQUcsSUFBQSxpQkFBVSxFQUFDLFFBQVEsQ0FB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