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
            return 'Ingrese una fecha válida. El formato es DD-MM o DD-MM-YYYY.';
        }
        const time = date.getTime();
        const { min, max, futureDate } = argument;
        if (futureDate && time < Date.now()) {
            return 'Ingrese una fecha en el futuro.';
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
        input = input + '/' + (0, util_1.dateAtSantiago)().getFullYear();
    }
    const parsedInput = input.replace(/-/g, '/').split('/').reverse().join('/');
    const date = (0, util_1.dateAtSantiago)(parsedInput);
    return isNaN(date.getTime()) ? null : date;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdHlwZXMvZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxrQ0FBa0U7QUFDbEUsaUNBQTJEO0FBRTNELE1BQU0sU0FBUyxHQUFHLHVDQUF1QyxDQUFDO0FBRTFELE1BQWEsdUJBQXdCLFNBQVEsMEJBQXNDO0lBQy9FLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUUsbUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQWEsRUFBRSxDQUFVLEVBQUUsUUFBcUM7UUFDNUUsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLE9BQU8sNkRBQTZELENBQUM7UUFDekUsQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDMUMsSUFBSSxVQUFVLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQ2xDLE9BQU8saUNBQWlDLENBQUM7UUFDN0MsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFBLGdCQUFTLEVBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ2hDLE9BQU8scUNBQXFDLElBQUEsbUJBQVksRUFBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDL0UsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFBLGdCQUFTLEVBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ2hDLE9BQU8scUNBQXFDLElBQUEsbUJBQVksRUFBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDL0UsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBYTtRQUN0QixPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQVMsQ0FBQztJQUNwQyxDQUFDO0NBQ0o7QUE3QkQsMERBNkJDO0FBRUQsU0FBUyxTQUFTLENBQUMsS0FBYTtJQUM1QixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxLQUFLO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ1osS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBQSxxQkFBYyxHQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekQsQ0FBQztJQUVELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUUsTUFBTSxJQUFJLEdBQUcsSUFBQSxxQkFBYyxFQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUMvQyxDQUFDIn0=