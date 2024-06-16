"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateArgumentTypeHandler = void 0;
const util_1 = require("../util");
const base_1 = require("./base");
const dateRegex = /^[0-3]?\d[/-][01]?\d((?:[/-]\d{4}))?$/;
class DateArgumentTypeHandler extends base_1.ArgumentTypeHandler {
    constructor(client) {
        super(client, base_1.ArgumentType.Date);
    }
    validate(value, _, argument) {
        const date = parseDate(value);
        if (!date) {
            return "Ingrese una fecha válida. El formato es DD-MM o DD-MM-YYYY.";
        }
        const time = date.getTime();
        const { min, max, futureDate, } = argument;
        if (futureDate && time < Date.now()) {
            return "Ingrese una fecha en el futuro.";
        }
        if (!(0, util_1.isNullish)(min) && time < min) {
            return `Ingrese una fecha mayor o igual a ${(0, util_1.dateToString)(new Date(min))}.`;
        }
        if (!(0, util_1.isNullish)(max) && time > max) {
            return `Ingrese una fecha menor o igual a ${(0, util_1.dateToString)(new Date(max))}.`;
        }
        return true;
    }
    parse(value) {
        return parseDate(value);
    }
}
exports.DateArgumentTypeHandler = DateArgumentTypeHandler;
function parseDate(input) {
    const match = input.match(dateRegex);
    if (!match)
        return null;
    if (!match[1]) {
        input = input + "/" + (0, util_1.dateAtSantiago)().getFullYear();
    }
    const parsedInput = input.replace(/-/g, "/").split("/").reverse().join("/");
    const date = (0, util_1.dateAtSantiago)(parsedInput);
    return isNaN(date.getTime()) ? null : date;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdHlwZXMvZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxrQ0FBa0U7QUFDbEUsaUNBQTJEO0FBRTNELE1BQU0sU0FBUyxHQUFHLHVDQUF1QyxDQUFDO0FBRzFELE1BQWEsdUJBQXdCLFNBQVEsMEJBQXNDO0lBQy9FLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUUsbUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQWEsRUFBRSxDQUFVLEVBQUUsUUFBcUM7UUFDNUUsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLE9BQU8sNkRBQTZELENBQUM7UUFDekUsQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QixNQUFNLEVBQ0YsR0FBRyxFQUNILEdBQUcsRUFDSCxVQUFVLEdBQ2IsR0FBRyxRQUFRLENBQUM7UUFDYixJQUFJLFVBQVUsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDbEMsT0FBTyxpQ0FBaUMsQ0FBQztRQUM3QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUEsZ0JBQVMsRUFBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDaEMsT0FBTyxxQ0FBcUMsSUFBQSxtQkFBWSxFQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUMvRSxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUEsZ0JBQVMsRUFBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDaEMsT0FBTyxxQ0FBcUMsSUFBQSxtQkFBWSxFQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUMvRSxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhO1FBQ3RCLE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBUyxDQUFDO0lBQ3BDLENBQUM7Q0FDSjtBQWpDRCwwREFpQ0M7QUFFRCxTQUFTLFNBQVMsQ0FBQyxLQUFhO0lBQzVCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckMsSUFBSSxDQUFDLEtBQUs7UUFBRSxPQUFPLElBQUksQ0FBQztJQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDWixLQUFLLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFBLHFCQUFjLEdBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0lBRUQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM1RSxNQUFNLElBQUksR0FBRyxJQUFBLHFCQUFjLEVBQUMsV0FBVyxDQUFDLENBQUM7SUFDekMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQy9DLENBQUMifQ==