"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionsHistoryTable = exports.ActionType = exports.assignmentsTable = exports.AssignmentType = exports.subjectsTable = void 0;
const lib_1 = require("./lib");
exports.subjectsTable = {
    name: "udec_subjects",
    columns: [{
            name: "chat_id",
            type: lib_1.ColumnType.Bigint,
            nonNull: true,
            primaryKey: true,
        }, {
            name: "code",
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
        }, {
            name: "name",
            type: lib_1.ColumnType.String,
            size: 150,
            nonNull: true,
        }, {
            name: "credits",
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
    name: "udec_assignments",
    foreignKeys: [{
            keys: ["chat_id", "subject_code"],
            references: exports.subjectsTable.name,
            referenceKeys: [exports.subjectsTable.columns[0].name, exports.subjectsTable.columns[1].name],
        }],
    columns: [{
            name: "id",
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
            autoIncrement: true,
        }, {
            name: "chat_id",
            type: lib_1.ColumnType.Bigint,
            nonNull: true,
            primaryKey: true,
        }, {
            name: "subject_code",
            type: lib_1.ColumnType.Integer,
            nonNull: true,
        }, {
            name: "type",
            type: lib_1.ColumnType.Enum,
            values: Object.values(AssignmentType),
            nonNull: true,
        }, {
            name: "date_due",
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
    name: "udec_actions_history",
    columns: [{
            name: "id",
            type: lib_1.ColumnType.Integer,
            nonNull: true,
            primaryKey: true,
            autoIncrement: true,
        }, {
            name: "chat_id",
            type: lib_1.ColumnType.Bigint,
            nonNull: true,
            primaryKey: true,
        }, {
            name: "type",
            type: lib_1.ColumnType.Enum,
            values: Object.values(ActionType),
            nonNull: true,
        }, {
            name: "username",
            type: lib_1.ColumnType.String,
            size: 150,
            nonNull: true,
        }, {
            name: "timestamp",
            type: lib_1.ColumnType.Timestamp,
            nonNull: true,
        }],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBdUY7QUFFMUUsUUFBQSxhQUFhLEdBQUc7SUFDekIsSUFBSSxFQUFFLGVBQWU7SUFDckIsT0FBTyxFQUFFLENBQUM7WUFDTixJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtTQUNuQixFQUFFO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxPQUFPO1lBQ3hCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsVUFBVSxFQUFFLElBQUk7U0FDbkIsRUFBRTtZQUNDLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLGdCQUFVLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQztDQUM4QixDQUFDO0FBS3JDLElBQVksY0FNWDtBQU5ELFdBQVksY0FBYztJQUN0QixvQ0FBa0IsQ0FBQTtJQUNsQiwrQkFBYSxDQUFBO0lBQ2IsbUNBQWlCLENBQUE7SUFDakIsc0NBQW9CLENBQUE7SUFDcEIsb0NBQWtCLENBQUE7QUFDdEIsQ0FBQyxFQU5XLGNBQWMsOEJBQWQsY0FBYyxRQU16QjtBQUVZLFFBQUEsZ0JBQWdCLEdBQUc7SUFDNUIsSUFBSSxFQUFFLGtCQUFrQjtJQUN4QixXQUFXLEVBQUUsQ0FBQztZQUNWLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUM7WUFDakMsVUFBVSxFQUFFLHFCQUFhLENBQUMsSUFBSTtZQUM5QixhQUFhLEVBQUUsQ0FBQyxxQkFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUscUJBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ3hELENBQUM7SUFDMUIsT0FBTyxFQUFFLENBQUM7WUFDTixJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtZQUNoQixhQUFhLEVBQUUsSUFBSTtTQUN0QixFQUFFO1lBQ0MsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxNQUFNO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsVUFBVSxFQUFFLElBQUk7U0FDbkIsRUFBRTtZQUNDLElBQUksRUFBRSxjQUFjO1lBQ3BCLElBQUksRUFBRSxnQkFBVSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxNQUFNO1lBQ1osSUFBSSxFQUFFLGdCQUFVLENBQUMsSUFBSTtZQUNyQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQThCO1lBQ2xFLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLEVBQUU7WUFDQyxJQUFJLEVBQUUsVUFBVTtZQUNoQixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxJQUFJO1lBQ3JCLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUM7Q0FDOEIsQ0FBQztBQUtyQyxJQUFZLFVBS1g7QUFMRCxXQUFZLFVBQVU7SUFDbEIsd0NBQTBCLENBQUE7SUFDMUIsOENBQWdDLENBQUE7SUFDaEMscUNBQXVCLENBQUE7SUFDdkIsMkNBQTZCLENBQUE7QUFDakMsQ0FBQyxFQUxXLFVBQVUsMEJBQVYsVUFBVSxRQUtyQjtBQUVZLFFBQUEsbUJBQW1CLEdBQUc7SUFDL0IsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QixPQUFPLEVBQUUsQ0FBQztZQUNOLElBQUksRUFBRSxJQUFJO1lBQ1YsSUFBSSxFQUFFLGdCQUFVLENBQUMsT0FBTztZQUN4QixPQUFPLEVBQUUsSUFBSTtZQUNiLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLGFBQWEsRUFBRSxJQUFJO1NBQ3RCLEVBQUU7WUFDQyxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtTQUNuQixFQUFFO1lBQ0MsSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsZ0JBQVUsQ0FBQyxJQUFJO1lBQ3JCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBMEI7WUFDMUQsT0FBTyxFQUFFLElBQUk7U0FDaEIsRUFBRTtZQUNDLElBQUksRUFBRSxVQUFVO1lBQ2hCLElBQUksRUFBRSxnQkFBVSxDQUFDLE1BQU07WUFDdkIsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsSUFBSTtTQUNoQixFQUFFO1lBQ0MsSUFBSSxFQUFFLFdBQVc7WUFDakIsSUFBSSxFQUFFLGdCQUFVLENBQUMsU0FBUztZQUMxQixPQUFPLEVBQUUsSUFBSTtTQUNoQixDQUFDO0NBQzhCLENBQUMifQ==