"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgumentTypeHandler = exports.ArgumentType = void 0;
var ArgumentType;
(function (ArgumentType) {
    ArgumentType["Boolean"] = "booleano";
    ArgumentType["Number"] = "n\u00FAmero";
    ArgumentType["String"] = "texto";
    ArgumentType["Date"] = "fecha";
})(ArgumentType || (exports.ArgumentType = ArgumentType = {}));
class ArgumentTypeHandler {
    client;
    type;
    constructor(client, type) {
        this.client = client;
        this.type = type;
    }
    isEmpty(value, _context, _argument) {
        return value.length === 0;
    }
}
exports.ArgumentTypeHandler = ArgumentTypeHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdHlwZXMvYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSxJQUFZLFlBS1g7QUFMRCxXQUFZLFlBQVk7SUFDcEIsb0NBQW9CLENBQUE7SUFDcEIsc0NBQWlCLENBQUE7SUFDakIsZ0NBQWdCLENBQUE7SUFDaEIsOEJBQWMsQ0FBQTtBQUNsQixDQUFDLEVBTFcsWUFBWSw0QkFBWixZQUFZLFFBS3ZCO0FBU0QsTUFBc0IsbUJBQW1CO0lBQ3JCLE1BQU0sQ0FBaUI7SUFDdkIsSUFBSSxDQUFlO0lBRW5DLFlBQXNCLE1BQXNCLEVBQUUsSUFBTztRQUNqRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBTU0sT0FBTyxDQUFDLEtBQWEsRUFBRSxRQUF3QixFQUFFLFNBQXNCO1FBQzFFLE9BQU8sS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7SUFDOUIsQ0FBQztDQUNKO0FBaEJELGtEQWdCQyJ9