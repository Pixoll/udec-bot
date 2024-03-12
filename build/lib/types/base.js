"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgumentTypeHandler = exports.ArgumentType = void 0;
var ArgumentType;
(function (ArgumentType) {
    ArgumentType["Boolean"] = "booleano";
    ArgumentType["Number"] = "n\u00FAmero";
    ArgumentType["String"] = "texto";
})(ArgumentType || (exports.ArgumentType = ArgumentType = {}));
class ArgumentTypeHandler {
    client;
    type;
    constructor(client, type) {
        this.client = client;
        this.type = type;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isEmpty(value, _context, _argument) {
        return value.length === 0;
    }
}
exports.ArgumentTypeHandler = ArgumentTypeHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdHlwZXMvYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxJQUFZLFlBSVg7QUFKRCxXQUFZLFlBQVk7SUFDcEIsb0NBQW9CLENBQUE7SUFDcEIsc0NBQWlCLENBQUE7SUFDakIsZ0NBQWdCLENBQUE7QUFDcEIsQ0FBQyxFQUpXLFlBQVksNEJBQVosWUFBWSxRQUl2QjtBQVFELE1BQXNCLG1CQUFtQjtJQUNyQixNQUFNLENBQWlCO0lBQ3ZCLElBQUksQ0FBZTtJQUVuQyxZQUFtQixNQUFzQixFQUFFLElBQU87UUFDOUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQU1ELDZEQUE2RDtJQUN0RCxPQUFPLENBQUMsS0FBYSxFQUFFLFFBQXdCLEVBQUUsU0FBc0I7UUFDMUUsT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0NBQ0o7QUFqQkQsa0RBaUJDIn0=