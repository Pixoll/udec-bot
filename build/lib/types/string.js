"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringArgumentTypeHandler = void 0;
const util_1 = require("../util");
const base_1 = require("./base");
class StringArgumentTypeHandler extends base_1.ArgumentTypeHandler {
    constructor(client) {
        super(client, base_1.ArgumentType.String);
    }
    validate(value, _, argument) {
        const { choices, max, min, key } = argument;
        if (choices && !choices.map(c => c.toLowerCase()).includes(value.toLowerCase())) {
            return `Ingrese una de las siguientes opciones: ${choices.map(c => `\`${c}\``).join(", ")}`;
        }
        if (!(0, util_1.isNullish)(min) && value.length < min) {
            return `"${key}" debe tener al menos ${min} caracteres.`;
        }
        if (!(0, util_1.isNullish)(max) && value.length > max) {
            return `${key} debe tener máximo ${max} caracteres.`;
        }
        return true;
    }
    parse(value) {
        return value;
    }
}
exports.StringArgumentTypeHandler = StringArgumentTypeHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi90eXBlcy9zdHJpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsa0NBQW9DO0FBQ3BDLGlDQUEyRDtBQUczRCxNQUFhLHlCQUEwQixTQUFRLDBCQUF3QztJQUNuRixZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLG1CQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFhLEVBQUUsQ0FBVSxFQUFFLFFBQXVDO1FBQzlFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDNUMsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDOUUsT0FBTywyQ0FBMkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNoRyxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUEsZ0JBQVMsRUFBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3hDLE9BQU8sSUFBSSxHQUFHLHlCQUF5QixHQUFHLGNBQWMsQ0FBQztRQUM3RCxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUEsZ0JBQVMsRUFBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ3hDLE9BQU8sR0FBRyxHQUFHLHNCQUFzQixHQUFHLGNBQWMsQ0FBQztRQUN6RCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhO1FBQ3RCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQXRCRCw4REFzQkMifQ==