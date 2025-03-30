export enum ClassType {
    T,
    P,
    L,
}

export enum ClassDay {
    LU,
    MA,
    MI,
    JU,
    VI,
    SA,
    DO,
}

export type Subject = {
    code: number;
    name: string;
    credits?: number;
    section: number;
    schedule: SubjectSchedule[];
};

export type SubjectSchedule = SubjectScheduleDefined | SubjectScheduleTDB;

export type SubjectScheduleDefined = {
    type: ClassType;
    group?: number;
    day: ClassDay;
    blocks: number[];
    classroom: string;
};

export type SubjectScheduleTDB = {
    type?: ClassType;
    group?: number;
    tbd: true;
};
