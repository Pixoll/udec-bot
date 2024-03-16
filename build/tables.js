"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionsHistoryTable = exports.ActionType = exports.assignmentsTable = exports.AssignmentType = exports.subjectsTable = void 0;
const lib_1 = require("./lib");
exports.subjectsTable = {
    name: 'udec_subjects',
    columns: [{
            name: 'code',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
            unique: true,
        }, {
            name: 'chat_id',
            type: lib_1.ColumnType.Bigint,
            nonNull: true,
        }, {
            name: 'name',
            type: lib_1.ColumnType.String,
            size: 150,
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
    name: 'udec_assignments',
    columns: [{
            name: 'id',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        }, {
            name: 'chat_id',
            type: lib_1.ColumnType.Bigint,
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
    name: 'udec_actions_history',
    columns: [{
            name: 'id',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        }, {
            name: 'chat_id',
            type: lib_1.ColumnType.Bigint,
            nonNull: true,
        }, {
            name: 'type',
            type: lib_1.ColumnType.Enum,
            values: Object.values(ActionType),
            nonNull: true,
        }, {
            name: 'username',
            type: lib_1.ColumnType.String,
            size: 150,
            nonNull: true,
        }, {
            name: 'timestamp',
            type: lib_1.ColumnType.Timestamp,
            nonNull: true,
        }],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBb0Q7QUFFdkMsUUFBQSxhQUFhLEdBQUc7SUFDekIsSUFBSSxFQUFFLGVBQWU7SUFDckIsT0FBTyxFQUFFLENBQUM7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNmLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQztDQUM4QixDQUFDO0FBRXJDLElBQVksY0FLWDtBQUxELFdBQVksY0FBYztJQUN0QixvQ0FBa0IsQ0FBQTtJQUNsQiwrQkFBYSxDQUFBO0lBQ2IsbUNBQWlCLENBQUE7SUFDakIsc0NBQW9CLENBQUE7QUFDeEIsQ0FBQyxFQUxXLGNBQWMsOEJBQWQsY0FBYyxRQUt6QjtBQUVZLFFBQUEsZ0JBQWdCLEdBQUc7SUFDNUIsSUFBSSxFQUFFLGtCQUFrQjtJQUN4QixPQUFPLEVBQUUsQ0FBQztZQUNOLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtZQUNiLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1lBQ1osYUFBYSxFQUFFLElBQUk7U0FDdEIsRUFBRTtZQUNDLElBQUksRUFBRSxTQUFTO1lBQ2YsSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLGNBQWM7WUFDcEIsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxJQUFJO1lBQ3JCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBOEI7WUFDbEUsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxVQUFVO1lBQ2hCLElBQUksRUFBRSxnQkFBVSxDQUFDLElBQUk7WUFDckIsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQztDQUM4QixDQUFDO0FBRXJDLElBQVksVUFHWDtBQUhELFdBQVksVUFBVTtJQUNsQixpQ0FBYyxDQUFBO0lBQ2QsZ0NBQWtCLENBQUE7QUFDdEIsQ0FBQyxFQUhXLFVBQVUsMEJBQVYsVUFBVSxRQUdyQjtBQUVZLFFBQUEsbUJBQW1CLEdBQUc7SUFDL0IsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QixPQUFPLEVBQUUsQ0FBQztZQUNOLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtZQUNiLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1lBQ1osYUFBYSxFQUFFLElBQUk7U0FDdEIsRUFBRTtZQUNDLElBQUksRUFBRSxTQUFTO1lBQ2YsSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxJQUFJO1lBQ3JCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBMEI7WUFDMUQsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxVQUFVO1lBQ2hCLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLFdBQVc7WUFDakIsSUFBSSxFQUFFLGdCQUFVLENBQUMsU0FBUztZQUMxQixPQUFPLEVBQUUsSUFBSTtTQUNoQixDQUFDO0NBQzhCLENBQUMifQ==