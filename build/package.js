"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const packageJson = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../package.json'), 'utf-8'));
exports.default = packageJson;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYWNrYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkJBQWtDO0FBQ2xDLGdEQUF3QjtBQUV4QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUEsaUJBQVksRUFBQyxjQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFnQixDQUFDO0FBQzlHLGtCQUFlLFdBQVcsQ0FBQyJ9