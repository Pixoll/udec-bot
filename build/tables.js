"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionsHistoryTable = exports.ActionType = exports.assignmentsTable = exports.AssignmentType = exports.subjectsTable = void 0;
const lib_1 = require("./lib");
exports.subjectsTable = {
    name: 'subjects',
    columns: [{
            name: 'code',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
            unique: true,
        }, {
            name: 'name',
            type: lib_1.ColumnType.String,
            size: 128,
            nonNull: true,
        }, {
            name: 'credits',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
        }],
};
var AssignmentType;
(function (AssignmentType) {
    AssignmentType["Homework"] = "tarea";
    AssignmentType["Test"] = "test";
    AssignmentType["Exam"] = "certamen";
    AssignmentType["Project"] = "proyecto";
})(AssignmentType || (exports.AssignmentType = AssignmentType = {}));
exports.assignmentsTable = {
    name: 'assignments',
    columns: [{
            name: 'id',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        }, {
            name: 'chat_id',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
        }, {
            name: 'subject_code',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
        }, {
            name: 'type',
            type: lib_1.ColumnType.Enum,
            values: Object.values(AssignmentType),
            nonNull: true,
        }, {
            name: 'date_due',
            type: lib_1.ColumnType.Date,
            nonNull: true,
        }],
};
var ActionType;
(function (ActionType) {
    ActionType["Add"] = "a\u00F1adir";
    ActionType["Remove"] = "remover";
})(ActionType || (exports.ActionType = ActionType = {}));
exports.actionsHistoryTable = {
    name: 'actions_history',
    columns: [{
            name: 'id',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        }, {
            name: 'chat_id',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
        }, {
            name: 'type',
            type: lib_1.ColumnType.Enum,
            values: Object.values(ActionType),
            nonNull: true,
        }, {
            name: 'username',
            type: lib_1.ColumnType.String,
            size: 129,
            nonNull: true,
        }, {
            name: 'timestamp',
            type: lib_1.ColumnType.Timestamp,
            nonNull: true,
        }],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBb0Q7QUFFdkMsUUFBQSxhQUFhLEdBQUc7SUFDekIsSUFBSSxFQUFFLFVBQVU7SUFDaEIsT0FBTyxFQUFFLENBQUM7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNmLEVBQUU7WUFDQyxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUM7Q0FDOEIsQ0FBQztBQUVyQyxJQUFZLGNBS1g7QUFMRCxXQUFZLGNBQWM7SUFDdEIsb0NBQWtCLENBQUE7SUFDbEIsK0JBQWEsQ0FBQTtJQUNiLG1DQUFpQixDQUFBO0lBQ2pCLHNDQUFvQixDQUFBO0FBQ3hCLENBQUMsRUFMVyxjQUFjLDhCQUFkLGNBQWMsUUFLekI7QUFFWSxRQUFBLGdCQUFnQixHQUFHO0lBQzVCLElBQUksRUFBRSxhQUFhO0lBQ25CLE9BQU8sRUFBRSxDQUFDO1lBQ04sSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsVUFBVSxFQUFFLElBQUk7WUFDaEIsTUFBTSxFQUFFLElBQUk7WUFDWixhQUFhLEVBQUUsSUFBSTtTQUN0QixFQUFFO1lBQ0MsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsY0FBYztZQUNwQixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLElBQUk7WUFDckIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUE4QjtZQUNsRSxPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLFVBQVU7WUFDaEIsSUFBSSxFQUFFLGdCQUFVLENBQUMsSUFBSTtZQUNyQixPQUFPLEVBQUUsSUFBSTtTQUNoQixDQUFDO0NBQzhCLENBQUM7QUFFckMsSUFBWSxVQUdYO0FBSEQsV0FBWSxVQUFVO0lBQ2xCLGlDQUFjLENBQUE7SUFDZCxnQ0FBa0IsQ0FBQTtBQUN0QixDQUFDLEVBSFcsVUFBVSwwQkFBVixVQUFVLFFBR3JCO0FBRVksUUFBQSxtQkFBbUIsR0FBRztJQUMvQixJQUFJLEVBQUUsaUJBQWlCO0lBQ3ZCLE9BQU8sRUFBRSxDQUFDO1lBQ04sSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsVUFBVSxFQUFFLElBQUk7WUFDaEIsTUFBTSxFQUFFLElBQUk7WUFDWixhQUFhLEVBQUUsSUFBSTtTQUN0QixFQUFFO1lBQ0MsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLElBQUk7WUFDckIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUEwQjtZQUMxRCxPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLFVBQVU7WUFDaEIsSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsV0FBVztZQUNqQixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxTQUFTO1lBQzFCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUM7Q0FDOEIsQ0FBQyJ9