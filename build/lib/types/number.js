"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberArgumentTypeHandler = void 0;
const util_1 = require("../util");
const base_1 = require("./base");
class NumberArgumentTypeHandler extends base_1.ArgumentTypeHandler {
    constructor(client) {
        super(client, base_1.ArgumentType.Number);
    }
    validate(value, _, argument) {
        const { choices, max, min } = argument;
        if (isNaN(+value) || !/^\d+$/.test(value))
            return false;
        const number = parseInt(value);
        if (choices && !choices.includes(number)) {
            return `Ingrese una de las siguientes opciones: ${choices.map(c => `\`${c}\``).join(', ')}`;
        }
        if (!(0, util_1.isNullish)(min) && number < min) {
            return `Ingrese un número mayor o igual a ${min}.`;
        }
        if (!(0, util_1.isNullish)(max) && number > max) {
            return `Ingrese un número menor o igual a ${max}.`;
        }
        return true;
    }
    parse(value) {
        return +value;
    }
}
exports.NumberArgumentTypeHandler = NumberArgumentTypeHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi90eXBlcy9udW1iZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsa0NBQW9DO0FBQ3BDLGlDQUEyRDtBQUUzRCxNQUFhLHlCQUEwQixTQUFRLDBCQUF3QztJQUNuRixZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLG1CQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFhLEVBQUUsQ0FBVSxFQUFFLFFBQXVDO1FBQzlFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQztRQUN2QyxJQUFJLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN4RCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFL0IsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDdkMsT0FBTywyQ0FBMkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNoRyxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUEsZ0JBQVMsRUFBQyxHQUFHLENBQUMsSUFBSSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDbEMsT0FBTyxxQ0FBcUMsR0FBRyxHQUFHLENBQUM7UUFDdkQsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFBLGdCQUFTLEVBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ2xDLE9BQU8scUNBQXFDLEdBQUcsR0FBRyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQWE7UUFDdEIsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUExQkQsOERBMEJDIn0=