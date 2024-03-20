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
    examples: [],
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
        const { default: defaultValue, required, typeHandler, key, label, prompt, whenInvalid, examples } = this;
        const name = label ?? key;
        const type = typeHandler.type;
        const empty = this.isEmpty(value, context);
        const parsedExamples = examples.length > 0
            ? `\n\nEjemplos: ${examples.map(e => `\`${(0, util_1.escapeMarkdown)(e)}\``).join(', ')}.`
            : '';
        if (empty) {
            if (required) {
                return {
                    ok: false,
                    error: ArgumentResultErrorType.Empty,
                    message: (prompt ?? (0, util_1.escapeMarkdown)(`Ingrese el argumento "${name}" de tipo ${type}.`)) + parsedExamples,
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
                    : (0, util_1.escapeMarkdown)(`Argumento inválido, "${name}" debe ser de tipo ${type}.`))) + parsedExamples,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2NvbW1hbmRzL2FyZ3VtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLGtDQUEwRDtBQTBCMUQsSUFBWSx1QkFHWDtBQUhELFdBQVksdUJBQXVCO0lBQy9CLHVFQUFLLENBQUE7SUFDTCwyRUFBTyxDQUFBO0FBQ1gsQ0FBQyxFQUhXLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLFFBR2xDO0FBYUQsTUFBTSxjQUFjLEdBQUc7SUFDbkIsS0FBSyxFQUFFLElBQUk7SUFDWCxNQUFNLEVBQUUsSUFBSTtJQUNaLFFBQVEsRUFBRSxLQUFLO0lBQ2YsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSTtJQUNiLEdBQUcsRUFBRSxJQUFJO0lBQ1QsR0FBRyxFQUFFLElBQUk7SUFDVCxVQUFVLEVBQUUsS0FBSztJQUNqQixXQUFXLEVBQUUsSUFBSTtJQUNqQixRQUFRLEVBQUUsRUFBRTtDQUM2QixDQUFDO0FBRTlDLE1BQWEsUUFBUTtJQUlELFdBQVcsQ0FBeUI7SUFTcEMsTUFBTSxDQUFrRDtJQUN4RCxTQUFTLENBQXFEO0lBQzlELFlBQVksQ0FBb0Q7SUFDaEUsTUFBTSxDQUFpQjtJQUV2QyxZQUFtQixNQUFzQixFQUFFLE9BQTJCO1FBQ2xFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUM7UUFDMUMsSUFBSSxDQUFDLFlB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