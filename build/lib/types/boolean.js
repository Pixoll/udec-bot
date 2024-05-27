"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanArgumentTypeHandler = void 0;
const base_1 = require("./base");
const truthy = new Set(["true", "t", "yes", "y", "on", "enable", "enabled", "1", "+"]);
const falsy = new Set(["false", "f", "no", "n", "off", "disable", "disabled", "0", "-"]);
class BooleanArgumentTypeHandler extends base_1.ArgumentTypeHandler {
    constructor(client) {
        super(client, base_1.ArgumentType.Boolean);
    }
    validate(value) {
        const lc = value.toLowerCase();
        return truthy.has(lc) || falsy.has(lc);
    }
    parse(value) {
        const lc = value.toLowerCase();
        if (truthy.has(lc))
            return true;
        if (falsy.has(lc))
            return false;
        throw new RangeError("Unknown boolean value.");
    }
}
exports.BooleanArgumentTypeHandler = BooleanArgumentTypeHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vbGVhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdHlwZXMvYm9vbGVhbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpQ0FBMkQ7QUFFM0QsTUFBTSxNQUFNLEdBQXdCLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVHLE1BQU0sS0FBSyxHQUF3QixJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUU5RyxNQUFhLDBCQUEyQixTQUFRLDBCQUF5QztJQUNyRixZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFLG1CQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVNLFFBQVEsQ0FBQyxLQUFhO1FBQ3pCLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQWE7UUFDdEIsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9CLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUNoQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDaEMsTUFBTSxJQUFJLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ25ELENBQUM7Q0FDSjtBQWhCRCxnRUFnQkMifQ==