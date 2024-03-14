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
        const { min, max } = argument;
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
    if (isNaN(date.getTime()))
        return null;
    return date;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdHlwZXMvZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxrQ0FBa0U7QUFDbEUsaUNBQTJEO0FBRTNELE1BQU0sU0FBUyxHQUFHLHVDQUF1QyxDQUFDO0FBRTFELE1BQWEsdUJBQXdCLFNBQVEsMEJBQXNDO0lBQy9FLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUUsbUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQWEsRUFBRSxDQUFVLEVBQUUsUUFBcUM7UUFDNUUsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLE9BQU8sNkRBQTZELENBQUM7UUFDekUsQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBQSxnQkFBUyxFQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNoQyxPQUFPLHFDQUFxQyxJQUFBLG1CQUFZLEVBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQy9FLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBQSxnQkFBUyxFQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNoQyxPQUFPLHFDQUFxQyxJQUFBLG1CQUFZLEVBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQy9FLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQWE7UUFDdEIsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFTLENBQUM7SUFDcEMsQ0FBQztDQUNKO0FBMUJELDBEQTBCQztBQUVELFNBQVMsU0FBUyxDQUFDLEtBQWE7SUFDNUIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyQyxJQUFJLENBQUMsS0FBSztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNaLEtBQUssR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUEscUJBQWMsR0FBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pELENBQUM7SUFFRCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVFLE1BQU0sSUFBSSxHQUFHLElBQUEscUJBQWMsRUFBQyxXQUFXLENBQUMsQ0FBQztJQUN6QyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUN2QyxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDIn0=