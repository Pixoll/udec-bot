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
    prompt: null,
    required: false,
    default: null,
    choices: null,
    min: null,
    max: null,
    futureDate: false,
    whenInvalid: null,
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
        const { default: defaultValue, required, typeHandler, key, label, prompt, whenInvalid } = this;
        const name = label ?? key;
        const type = typeHandler.type;
        const empty = this.isEmpty(value, context);
        if (empty) {
            if (required) {
                return {
                    ok: false,
                    error: ArgumentResultErrorType.Empty,
                    message: prompt ?? (0, util_1.escapeMarkdown)(`Ingrese el argumento "${name}" de tipo ${type}.`),
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
                message: (isValid ? (0, util_1.escapeMarkdown)(isValid) : whenInvalid)
                    ?? (0, util_1.escapeMarkdown)(`Argumento inválido, "${name}" debe ser de tipo ${type}.`),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2NvbW1hbmRzL2FyZ3VtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLGtDQUEwRDtBQXlCMUQsSUFBWSx1QkFHWDtBQUhELFdBQVksdUJBQXVCO0lBQy9CLHVFQUFLLENBQUE7SUFDTCwyRUFBTyxDQUFBO0FBQ1gsQ0FBQyxFQUhXLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLFFBR2xDO0FBYUQsTUFBTSxjQUFjLEdBQUc7SUFDbkIsS0FBSyxFQUFFLElBQUk7SUFDWCxNQUFNLEVBQUUsSUFBSTtJQUNaLFFBQVEsRUFBRSxLQUFLO0lBQ2YsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSTtJQUNiLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxVQUFVLEVBQUUsS0FBSztJQUNqQixXQUFXLEVBQUUsSUFBSTtDQUN3QixDQUFDO0FBRTlDLE1BQWEsUUFBUTtJQUlELFdBQVcsQ0FBeUI7SUFRcEMsTUFBTSxDQUFrRDtJQUN4RCxTQUFTLENBQXFEO0lBQzlELFlBQVksQ0FBb0Q7SUFDaEUsTUFBTSxDQUFpQjtJQUV2QyxZQUFtQixNQUFzQixFQUFFLE9BQTJCO1FBQ2xFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUM7UUFDMUMsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsT0FB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