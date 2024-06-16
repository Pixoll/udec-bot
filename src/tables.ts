// noinspection JSUnusedGlobalSymbols

import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";

type Generated<T> = ColumnType<T, never, never>;
type Immutable<Select, Insert = Select> = ColumnType<Select, Insert, never>;

export type ChatId = `${number}`;

export enum ActionType {
    AddAssignment = "/addcert",
    RemoveAssignment = "/removecert",
    AddSubject = "/addramo",
    RemoveSubject = "/removeramo",
}

export interface ActionHistoryTable {
    chat_id: Immutable<ChatId>;
    id: Generated<number>;
    timestamp: Immutable<string>;
    type: Immutable<ActionType>;
    username: Immutable<string>;
}

export type ActionHistory = Selectable<ActionHistoryTable>;
export type NewActionHistory = Insertable<ActionHistoryTable>;

export enum AssignmentType {
    Homework = "tarea",
    Test = "test",
    Exam = "certamen",
    Project = "proyecto",
    Report = "informe",
}

export interface AssignmentTable {
    chat_id: Immutable<ChatId>;
    date_due: Immutable<string>;
    id: Generated<number>;
    subject_code: Immutable<number>;
    type: Immutable<AssignmentType>;
}

export type Assignment = Selectable<AssignmentTable>;
export type NewAssignment = Insertable<AssignmentTable>;

export interface ChatTable {
    id: Immutable<ChatId>;
}

export type Chat = Selectable<ChatTable>;
export type NewChat = Insertable<ChatTable>;
export type ChatUpdate = Updateable<ChatTable>;

export interface ChatSubjectTable {
    chat_id: Immutable<ChatId>;
    subject_code: Immutable<number>;
}

export type ChatSubject = Selectable<ChatSubjectTable>;
export type NewChatSubject = Insertable<ChatSubjectTable>;

export interface SubjectTable {
    code: Immutable<number>;
    credits: Immutable<number>;
    name: Immutable<string>;
}

export type Subject = Selectable<SubjectTable>;
export type NewSubject = Insertable<SubjectTable>;

export interface Database {
    udec_action_history: ActionHistoryTable;
    udec_assignment: AssignmentTable;
    udec_chat: ChatTable;
    udec_chat_subject: ChatSubjectTable;
    udec_subject: SubjectTable;
}
