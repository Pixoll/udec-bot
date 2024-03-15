"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Argument = exports.ArgumentResultErrorType = void 0;
const util_1 = require("../util");
var ArgumentResultErrorType;
(function (ArgumentResultErrorType) {
    ArgumentResultErrorType[ArgumentResultErrorType["Empty"] = 0] = "Empty";
    ArgumentResultErrorType[ArgumentResultErrorType["Invalid"] = 1] = "Invalid";
})(ArgumentResultErrorType || (exports.ArgumentResultErrorType = ArgumentResultErrorType = {}));
const defaultOptions = {
    label: null,
    required: false,
    default: null,
    choices: null,
    min: null,
    max: null,
};
class Argument {
    typeHandler;
    parser;
    validator;
    emptyChecker;
    client;
    constructor(client, options) {
        this.client = client;
        Object.assign(this, defaultOptions, (0, util_1.omit)(options, ['parse', 'validate', 'isEmpty']));
        this.parser = options.parse ?? null;
        this.validator = options.validate ?? null;
        this.emptyChecker = options.isEmpty ?? null;
        const argumentType = client.registry.types.get(options.type);
        if (!argumentType) {
            throw new Error(`Could not resolve argument type from id "${options.type}".`);
        }
        this.typeHandler = argumentType;
    }
    async obtain(value, context) {
        const { default: defaultValue, required, typeHandler, key, label } = this;
        const name = label ?? key;
        const type = typeHandler.type;
        const empty = this.isEmpty(value, context);
        if (empty) {
            if (required) {
                return {
                    ok: false,
                    error: ArgumentResultErrorType.Empty,
                    message: `Especifique argumento "${name}" de tipo ${type}`,
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
                message: isValid || `Argumento inválido, "${name}" debe ser de tipo ${type}`,
            };
        }
        const resolvedValue = await this.parse(value, context);
        return {
            ok: true,
            value: resolvedValue,
        };
    }
    async parse(value, context) {
        if (this.parser)
            return await this.parser(value, context, this);
        return await this.typeHandler.parse(value, context, this);
    }
    async validate(value, context) {
        if (this.validator)
            return await this.validator(value, context, this);
        return await this.typeHandler.validate(value, context, this);
    }
    isEmpty(value, context) {
        if (this.emptyChecker)
            return this.emptyChecker(value, context, this);
        return this.typeHandler.isEmpty(value, context, this);
    }
}
exports.Argument = Argument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2NvbW1hbmRzL2FyZ3VtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLGtDQUEwQztBQXVCMUMsSUFBWSx1QkFHWDtBQUhELFdBQVksdUJBQXVCO0lBQy9CLHVFQUFLLENBQUE7SUFDTCwyRUFBTyxDQUFBO0FBQ1gsQ0FBQyxFQUhXLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLFFBR2xDO0FBYUQsTUFBTSxjQUFjLEdBQUc7SUFDbkIsS0FBSyxFQUFFLElBQUk7SUFDWCxRQUFRLEVBQUUsS0FBSztJQUNmLE9BQU8sRUFBRSxJQUFJO0lBQ2IsT0FBTyxFQUFFLElBQUk7SUFDYixHQUFHLEVBQUUsSUFBSTtJQUNULEdBQUcsRUFBRSxJQUFJO0NBQ2dDLENBQUM7QUFFOUMsTUFBYSxRQUFRO0lBSUQsV0FBVyxDQUF5QjtJQU1wQyxNQUFNLENBQWtEO0lBQ3hELFNBQVMsQ0FBcUQ7SUFDOUQsWUFBWSxDQUFvRDtJQUNoRSxNQUFNLENBQWlCO0lBRXZDLFlBQW1CLE1BQXNCLEVBQUUsT0FBMkI7UUFDbEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJGLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQztRQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDO1FBQzVDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FB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