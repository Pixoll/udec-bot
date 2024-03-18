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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBMkU7QUFFOUQsUUFBQSxhQUFhLEdBQUc7SUFDekIsSUFBSSxFQUFFLGVBQWU7SUFDckIsT0FBTyxFQUFFLENBQUM7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNmLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQztDQUM4QixDQUFDO0FBS3JDLElBQVksY0FLWDtBQUxELFdBQVksY0FBYztJQUN0QixvQ0FBa0IsQ0FBQTtJQUNsQiwrQkFBYSxDQUFBO0lBQ2IsbUNBQWlCLENBQUE7SUFDakIsc0NBQW9CLENBQUE7QUFDeEIsQ0FBQyxFQUxXLGNBQWMsOEJBQWQsY0FBYyxRQUt6QjtBQUVZLFFBQUEsZ0JBQWdCLEdBQUc7SUFDNUIsSUFBSSxFQUFFLGtCQUFrQjtJQUN4QixPQUFPLEVBQUUsQ0FBQztZQUNOLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtZQUNiLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1lBQ1osYUFBYSxFQUFFLElBQUk7U0FDdEIsRUFBRTtZQUNDLElBQUksRUFBRSxTQUFTO1lBQ2YsSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLGNBQWM7WUFDcEIsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLGNBQWM7WUFDcEIsSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLElBQUk7WUFDckIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUE4QjtZQUNsRSxPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLFVBQVU7WUFDaEIsSUFBSSxFQUFFLGdCQUFVLENBQUMsSUFBSTtZQUNyQixPQUFPLEVBQUUsSUFBSTtTQUNoQixDQUFDO0NBQzhCLENBQUM7QUFLckMsSUFBWSxVQUtYO0FBTEQsV0FBWSxVQUFVO0lBQ2xCLHdDQUEwQixDQUFBO0lBQzFCLDhDQUFnQyxDQUFBO0lBQ2hDLHFDQUF1QixDQUFBO0lBQ3ZCLDJDQUE2QixDQUFBO0FBQ2pDLENBQUMsRUFMVyxVQUFVLDBCQUFWLFVBQVUsUUFLckI7QUFFWSxRQUFBLG1CQUFtQixHQUFHO0lBQy9CLElBQUksRUFBRSxzQkFBc0I7SUFDNUIsT0FBTyxFQUFFLENBQUM7WUFDTixJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtZQUNaLGFBQWEsRUFBRSxJQUFJO1NBQ3RCLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLGdCQUFVLENBQUMsSUFBSTtZQUNyQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQTBCO1lBQzFELE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsVUFBVTtZQUNoQixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxNQUFNO1lBQ3ZCLElBQUksRUFBRSxHQUFHO1lBQ1QsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxXQUFXO1lBQ2pCLElBQUksRUFBRSxnQkFBVSxDQUFDLFNBQVM7WUFDMUIsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQztDQUM4QixDQUFDIn0=