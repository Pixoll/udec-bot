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
    example: null,
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
        const { default: defaultValue, required, typeHandler, key, label, prompt, whenInvalid, example } = this;
        const name = label ?? key;
        const type = typeHandler.type;
        const empty = this.isEmpty(value, context);
        if (empty) {
            if (required) {
                return {
                    ok: false,
                    error: ArgumentResultErrorType.Empty,
                    message: (prompt ?? (0, util_1.escapeMarkdown)(`Ingrese el argumento "${name}" de tipo ${type}.`))
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
                    ? (0, util_1.escapeMarkdown)(isValid)
                    : (0, util_1.escapeMarkdown)(`Argumento inválido, "${name}" debe ser de tipo ${type}.`))) + (example ? `\n\n${example}` : ''),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2NvbW1hbmRzL2FyZ3VtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLGtDQUEwRDtBQTBCMUQsSUFBWSx1QkFHWDtBQUhELFdBQVksdUJBQXVCO0lBQy9CLHVFQUFLLENBQUE7SUFDTCwyRUFBTyxDQUFBO0FBQ1gsQ0FBQyxFQUhXLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLFFBR2xDO0FBYUQsTUFBTSxjQUFjLEdBQUc7SUFDbkIsS0FBSyxFQUFFLElBQUk7SUFDWCxNQUFNLEVBQUUsSUFBSTtJQUNaLFFBQVEsRUFBRSxLQUFLO0lBQ2YsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSTtJQUNiLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxVQUFVLEVBQUUsS0FBSztJQUNqQixXQUFXLEVBQUUsSUFBSTtJQUNqQixPQUFPLEVBQUUsSUFBSTtDQUM0QixDQUFDO0FBRTlDLE1BQWEsUUFBUTtJQUlELFdBQVcsQ0FBeUI7SUFTcEMsTUFBTSxDQUFrRDtJQUN4RCxTQUFTLENBQXFEO0lBQzlELFlBQVksQ0FBb0Q7SUFDaEUsTUFBTSxDQUFpQjtJQUV2QyxZQUFtQixNQUFzQixFQUFFLE9BQTJCO1FBQ2xFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUM7UUFDMUMsSUFBSSxDQUFDLFlB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