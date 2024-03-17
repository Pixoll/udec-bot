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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBb0Q7QUFFdkMsUUFBQSxhQUFhLEdBQUc7SUFDekIsSUFBSSxFQUFFLGVBQWU7SUFDckIsT0FBTyxFQUFFLENBQUM7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtZQUNoQixNQUFNLEVBQUUsSUFBSTtTQUNmLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQztDQUM4QixDQUFDO0FBSXJDLElBQVksY0FLWDtBQUxELFdBQVksY0FBYztJQUN0QixvQ0FBa0IsQ0FBQTtJQUNsQiwrQkFBYSxDQUFBO0lBQ2IsbUNBQWlCLENBQUE7SUFDakIsc0NBQW9CLENBQUE7QUFDeEIsQ0FBQyxFQUxXLGNBQWMsOEJBQWQsY0FBYyxRQUt6QjtBQUVZLFFBQUEsZ0JBQWdCLEdBQUc7SUFDNUIsSUFBSSxFQUFFLGtCQUFrQjtJQUN4QixPQUFPLEVBQUUsQ0FBQztZQUNOLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtZQUNiLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxJQUFJO1lBQ1osYUFBYSxFQUFFLElBQUk7U0FDdEIsRUFBRTtZQUNDLElBQUksRUFBRSxTQUFTO1lBQ2YsSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLGNBQWM7WUFDcEIsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxJQUFJO1lBQ3JCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBOEI7WUFDbEUsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxVQUFVO1lBQ2hCLElBQUksRUFBRSxnQkFBVSxDQUFDLElBQUk7WUFDckIsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQztDQUM4QixDQUFDO0FBSXJDLElBQVksVUFLWDtBQUxELFdBQVksVUFBVTtJQUNsQix3Q0FBMEIsQ0FBQTtJQUMxQiw4Q0FBZ0MsQ0FBQTtJQUNoQyxxQ0FBdUIsQ0FBQTtJQUN2QiwyQ0FBNkIsQ0FBQTtBQUNqQyxDQUFDLEVBTFcsVUFBVSwwQkFBVixVQUFVLFFBS3JCO0FBRVksUUFBQSxtQkFBbUIsR0FBRztJQUMvQixJQUFJLEVBQUUsc0JBQXNCO0lBQzVCLE9BQU8sRUFBRSxDQUFDO1lBQ04sSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsVUFBVSxFQUFFLElBQUk7WUFDaEIsTUFBTSxFQUFFLElBQUk7WUFDWixhQUFhLEVBQUUsSUFBSTtTQUN0QixFQUFFO1lBQ0MsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxNQUFNO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxnQkFBVSxDQUFDLElBQUk7WUFDckIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUEwQjtZQUMxRCxPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLFVBQVU7WUFDaEIsSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsV0FBVztZQUNqQixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxTQUFTO1lBQzFCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUM7Q0FDOEIsQ0FBQyJ9