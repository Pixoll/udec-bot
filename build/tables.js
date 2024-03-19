"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionsHistoryTable = exports.ActionType = exports.assignmentsTable = exports.AssignmentType = exports.subjectsTable = void 0;
const lib_1 = require("./lib");
exports.subjectsTable = {
    name: 'udec_subjects',
    columns: [{
            name: 'id',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        }, {
            name: 'code',
            type: lib_1.ColumnType.Integer,
            nonNull: true,
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
    AssignmentType["Report"] = "informe";
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
            name: 'subject_name',
            type: lib_1.ColumnType.String,
            size: 150,
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
    ActionType["AddAssignment"] = "/addcert";
    ActionType["RemoveAssignment"] = "/removecert";
    ActionType["AddSubject"] = "/addramo";
    ActionType["RemoveSubject"] = "/removeramo";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBMkU7QUFFOUQsUUFBQSxhQUFhLEdBQUc7SUFDekIsSUFBSSxFQUFFLGVBQWU7SUFDckIsT0FBTyxFQUFFLENBQUM7WUFDTixJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtZQUNaLGFBQWEsRUFBRSxJQUFJO1NBQ3RCLEVBQUU7WUFDQyxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxTQUFTO1lBQ2YsSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxNQUFNO1lBQ3ZCLElBQUksRUFBRSxHQUFHO1lBQ1QsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxTQUFTO1lBQ2YsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtTQUNoQixDQUFDO0NBQzhCLENBQUM7QUFLckMsSUFBWSxjQU1YO0FBTkQsV0FBWSxjQUFjO0lBQ3RCLG9DQUFrQixDQUFBO0lBQ2xCLCtCQUFhLENBQUE7SUFDYixtQ0FBaUIsQ0FBQTtJQUNqQixzQ0FBb0IsQ0FBQTtJQUNwQixvQ0FBa0IsQ0FBQTtBQUN0QixDQUFDLEVBTlcsY0FBYyw4QkFBZCxjQUFjLFFBTXpCO0FBRVksUUFBQSxnQkFBZ0IsR0FBRztJQUM1QixJQUFJLEVBQUUsa0JBQWtCO0lBQ3hCLE9BQU8sRUFBRSxDQUFDO1lBQ04sSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsVUFBVSxFQUFFLElBQUk7WUFDaEIsTUFBTSxFQUFFLElBQUk7WUFDWixhQUFhLEVBQUUsSUFBSTtTQUN0QixFQUFFO1lBQ0MsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxNQUFNO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsY0FBYztZQUNwQixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsY0FBYztZQUNwQixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxNQUFNO1lBQ3ZCLElBQUksRUFBRSxHQUFHO1lBQ1QsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLGdCQUFVLENBQUMsSUFBSTtZQUNyQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQThCO1lBQ2xFLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsVUFBVTtZQUNoQixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxJQUFJO1lBQ3JCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUM7Q0FDOEIsQ0FBQztBQUtyQyxJQUFZLFVBS1g7QUFMRCxXQUFZLFVBQVU7SUFDbEIsd0NBQTBCLENBQUE7SUFDMUIsOENBQWdDLENBQUE7SUFDaEMscUNBQXVCLENBQUE7SUFDdkIsMkNBQTZCLENBQUE7QUFDakMsQ0FBQyxFQUxXLFVBQVUsMEJBQVYsVUFBVSxRQUtyQjtBQUVZLFFBQUEsbUJBQW1CLEdBQUc7SUFDL0IsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QixPQUFPLEVBQUUsQ0FBQztZQUNOLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtZQUNiLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1lBQ1osYUFBYSxFQUFFLElBQUk7U0FDdEIsRUFBRTtZQUNDLElBQUksRUFBRSxTQUFTO1lBQ2YsSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxJQUFJO1lBQ3JCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBMEI7WUFDMUQsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxVQUFVO1lBQ2hCLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLFdBQVc7WUFDakIsSUFBSSxFQUFFLGdCQUFVLENBQUMsU0FBUztZQUMxQixPQUFPLEVBQUUsSUFBSTtTQUNoQixDQUFDO0NBQzhCLENBQUMifQ==