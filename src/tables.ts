import { ColumnType, TableDescriptor } from './lib';

export const subjectsTable = {
    name: 'subjects',
    columns: [{
        name: 'code',
        type: ColumnType.Integer,
        nonNull: true,
        primaryKey: true,
        unique: true,
    }, {
        name: 'name',
        type: ColumnType.String,
        size: 128,
        nonNull: true,
    }, {
        name: 'credits',
        type: ColumnType.Integer,
        nonNull: true,
    }],
} as const satisfies TableDescriptor;

export enum AssignmentType {
    Homework = 'tarea',
    Test = 'test',
    Exam = 'certamen',
    Project = 'proyecto',
}

export const assignmentsTable = {
    name: 'assignments',
    columns: [{
        name: 'id',
        type: ColumnType.Integer,
        nonNull: true,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
    }, {
        name: 'chat_id',
        type: ColumnType.Integer,
        nonNull: true,
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

export enum ActionType {
    Add = 'añadir',
    Remove = 'remover',
}

export const actionsHistoryTable = {
    name: 'actions_history',
    columns: [{
        name: 'id',
        type: ColumnType.Integer,
        nonNull: true,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
    }, {
        name: 'chat_id',
        type: ColumnType.Integer,
        nonNull: true,
    }, {
        name: 'type',
        type: ColumnType.Enum,
        values: Object.values(ActionType) as readonly ActionType[],
        nonNull: true,
    }, {
        name: 'username',
        type: ColumnType.String,
        size: 129,
        nonNull: true,
    }, {
        name: 'timestamp',
        type: ColumnType.Timestamp,
        nonNull: true,
    }],
} as const satisfies TableDescriptor;
