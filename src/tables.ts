import { ColumnType, ForeignKey, TableColumnValuePairs, TableDescriptor } from './lib';

export const subjectsTable = {
    name: 'udec_subjects',
    columns: [{
        name: 'chat_id',
        type: ColumnType.Bigint,
        nonNull: true,
        primaryKey: true,
    }, {
        name: 'code',
        type: ColumnType.Integer,
        nonNull: true,
        primaryKey: true,
    }, {
        name: 'name',
        type: ColumnType.String,
        size: 150,
        nonNull: true,
    }, {
        name: 'credits',
        type: ColumnType.Integer,
        nonNull: true,
    }],
} as const satisfies TableDescriptor;

export type SubjectsTable = typeof subjectsTable;
export type SubjectObject = TableColumnValuePairs<SubjectsTable, false>;

export enum AssignmentType {
    Homework = 'tarea',
    Test = 'test',
    Exam = 'certamen',
    Project = 'proyecto',
    Report = 'informe',
}

export const assignmentsTable = {
    name: 'udec_assignments',
    foreignKeys: [{
        keys: ['chat_id', 'subject_code'],
        references: subjectsTable.name,
        referenceKeys: [subjectsTable.columns[0].name, subjectsTable.columns[1].name],
    } satisfies ForeignKey<2>],
    columns: [{
        name: 'id',
        type: ColumnType.Integer,
        nonNull: true,
        unique: true,
        autoIncrement: true,
    }, {
        name: 'chat_id',
        type: ColumnType.Bigint,
        nonNull: true,
        primaryKey: true,
    }, {
        name: 'subject_code',
        type: ColumnType.Integer,
        nonNull: true,
    }, {
        name: 'type',
        type: ColumnType.Enum,
        values: Object.values(AssignmentType) as readonly AssignmentType[],
        nonNull: true,
    }, {
        name: 'date_due',
        type: ColumnType.Date,
        nonNull: true,
    }],
} as const satisfies TableDescriptor;

export type AssignmentsTable = typeof assignmentsTable;
export type AssignmentObject = TableColumnValuePairs<AssignmentsTable, false>;

export enum ActionType {
    AddAssignment = '/addcert',
    RemoveAssignment = '/removecert',
    AddSubject = '/addramo',
    RemoveSubject = '/removeramo',
}

export const actionsHistoryTable = {
    name: 'udec_actions_history',
    columns: [{
        name: 'id',
        type: ColumnType.Integer,
        nonNull: true,
        primaryKey: true,
        autoIncrement: true,
    }, {
        name: 'chat_id',
        type: ColumnType.Bigint,
        nonNull: true,
        primaryKey: true,
    }, {
        name: 'type',
        type: ColumnType.Enum,
        values: Object.values(ActionType) as readonly ActionType[],
        nonNull: true,
    }, {
        name: 'username',
        type: ColumnType.String,
        size: 150,
        nonNull: true,
    }, {
        name: 'timestamp',
        type: ColumnType.Timestamp,
        nonNull: true,
    }],
} as const satisfies TableDescriptor;

export type ActionsHistoryTable = typeof actionsHistoryTable;
export type ActionHistoryObject = TableColumnValuePairs<ActionsHistoryTable, false>;
