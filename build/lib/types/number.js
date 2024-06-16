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
        const { choices, max, min, } = argument;
        if (isNaN(+value) || !/^\d+$/.test(value))
            return false;
        const number = parseInt(value);
        if (choices && !choices.includes(number)) {
            return `Ingrese una de las siguientes opciones: ${choices.map(c => `\`${c}\``).join(", ")}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi90eXBlcy9udW1iZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsa0NBQW9DO0FBQ3BDLGlDQUEyRDtBQUczRCxNQUFhLHlCQUEwQixTQUFRLDBCQUF3QztJQUNuRixZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLG1CQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFhLEVBQUUsQ0FBVSxFQUFFLFFBQXVDO1FBQzlFLE1BQU0sRUFDRixPQUFPLEVBQ1AsR0FBRyxFQUNILEdBQUcsR0FDTixHQUFHLFFBQVEsQ0FBQztRQUNiLElBQUksS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3hELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUvQixJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUN2QyxPQUFPLDJDQUEyQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2hHLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBQSxnQkFBUyxFQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNsQyxPQUFPLHFDQUFxQyxHQUFHLEdBQUcsQ0FBQztRQUN2RCxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUEsZ0JBQVMsRUFBQyxHQUFHLENBQUMsSUFBSSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDbEMsT0FBTyxxQ0FBcUMsR0FBRyxHQUFHLENBQUM7UUFDdkQsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBYTtRQUN0QixPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ2xCLENBQUM7Q0FDSjtBQTlCRCw4REE4QkMifQ==