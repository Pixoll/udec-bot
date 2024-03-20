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
            .map(([fileName, commandModule]) => {
            if ('prototype' in commandModule && commandModule.prototype instanceof commands_1.Command) {
                return commandModule;
            }
            if ('default' in commandModule) {
                return commandModule.default;
            }
            const mod = commandModule;
            return mod[`${(0, util_1.capitalize)(fileName)}Command`];
        })
            .filter((command) => !(0, util_1.isNullish)(command));
        return this.registerCommands(commands);
    }
    registerTypeHandlersIn(path, ...exclude) {
        const typeHandlersFolder = (0, require_all_1.default)(path);
        const typeHandlers = Object.entries(typeHandlersFolder)
            .filter(([fileName]) => !exclude.includes(fileName))
            .map(([fileName, typeHandlerModule]) => {
            if ('prototype' in typeHandlerModule && typeHandlerModule.prototype instanceof types_1.ArgumentTypeHandler) {
                return typeHandlerModule;
            }
            if ('default' in typeHandlerModule) {
                return typeHandlerModule.default;
            }
            const mod = typeHandlerModule;
            return mod[`${(0, util_1.capitalize)(fileName)}ArgumentTypeHandler`];
        })
            .filter((type) => !(0, util_1.isNullish)(type));
        return this.registerTypeHandlers(typeHandlers);
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
            logger_1.Logger.info(`Running ${ctx.text}`, ctx.args);
            const context = (0, commands_1.parseContext)(ctx, client);
            const canRunHere = command.canRunHere(context);
            if (canRunHere !== true) {
                await context.fancyReply(canRunHere || 'No se puede usar este comando aquí.');
                next();
                return;
            }
            const activeMenu = this.client.activeMenus.has(context.session);
            if (command.ensureInactiveMenus && activeMenu) {
                await context.fancyReply(`Ya tienes un menú activo para /${activeMenu}. Usa /cancel para cerrarlo.`);
                next();
                return;
            }
            const args = await command.parseArgs(context);
            if (!args.ok) {
                await context.fancyReply(args.message, {
                    'parse_mode': 'MarkdownV2',
                });
                next();
                return;
            }
            await context.react('👍').catch(() => null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDhEQUFxQztBQUVyQyw2Q0FBMEM7QUFDMUMseUNBQXlFO0FBQ3pFLG1DQUF1SDtBQUN2SCxpQ0FBK0M7QUFDL0MscUNBQWtDO0FBTWxDLE1BQWEsY0FBYztJQUNQLE1BQU0sQ0FBaUI7SUFDdkIsUUFBUSxDQUE4QjtJQUN0QyxLQUFLLENBRW5CO0lBRUYsWUFBbUIsTUFBc0I7UUFDckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksdUJBQVUsRUFBNkIsQ0FBQztJQUM3RCxDQUFDO0lBRU0sa0JBQWtCLENBQUMsSUFBWSxFQUFFLEdBQUcsT0FBaUI7UUFDeEQsTUFBTSxjQUFjLEdBQWlELElBQUEscUJBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUN0RixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQzthQUMxQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkQsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRTtZQUMvQixJQUFJLFdBQVcsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLFNBQVMsWUFBWSxrQkFBTyxFQUFFLENBQUM7Z0JBQzdFLE9BQU8sYUFBYSxDQUFDO1lBQ3pCLENBQUM7WUFDRCxJQUFJLFNBQVMsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDN0IsT0FBTyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxNQUFNLEdB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