import { ColumnType, TableDescriptor } from './lib';

export const subjectsTable = {
    name: 'udec_subjects',
    columns: [{
        name: 'code',
        type: ColumnType.Integer,
        nonNull: true,
        primaryKey: true,
        unique: true,
    }, {
        name: 'chat_id',
        type: ColumnType.Bigint,
        nonNull: true,
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

export enum AssignmentType {
    Homework,
    Test,
    Exam,
    Project,
    _Length,
}

export const assignmentTypeMap = ['tarea', 'test', 'certamen', 'proyecto'] as const satisfies {
    length: AssignmentType._Length;
};

export const assignmentsTable = {
    name: 'udec_assignments',
    columns: [{
        name: 'id',
        type: ColumnType.Integer,
        nonNull: true,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
    }, {
        name: 'chat_id',
        type: ColumnType.Bigint,
        nonNull: true,
    }, {
        name: 'subject_code',
        type: ColumnType.Integer,
        nonNull: true,
    }, {
        name: 'type',
        type: ColumnType.Enum,
        values: Object.values(AssignmentType).filter(v => !isNaN(+v)),
        nonNull: true,
    }, {
        name: 'date_due',
        type: ColumnType.Date,
        nonNull: true,
    }],
} as const satisfies TableDescriptor;

export enum ActionType {
    AddAssignment,
    RemoveAssignment,
    AddSubject,
    RemoveSubject,
    _Length,
}

export const actionTypeMap = ['/addcert', '/removecert', '/addramo', '/removeramo'] as const satisfies {
    length: ActionType._Length;
};

export const actionsHistoryTable = {
    name: 'udec_actions_history',
    columns: [{
        name: 'id',
        type: ColumnType.Integer,
        nonNull: true,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
    }, {
        name: 'chat_id',
        type: ColumnType.Bigint,
        nonNull: true,
    }, {
        name: 'type',
        type: ColumnType.Enum,
        values: Object.values(ActionType).filter(v => !isNaN(+v)),
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
