export class SourceFilesDatatable {
    constructor(
        public first: number,
        public rows: number,
        public sortField: string,
        public sortOrder: number,
        public started: Date,
        public ended: Date,
        public time_field: string,
        public is_parsed: boolean,
        public file_name: string
    ) {}
}

export const initialSourceFilesDatatable: SourceFilesDatatable = {
    first: 0,
    rows: 10,
    sortField: 'last_modified',
    sortOrder: -1,
    started: null,
    ended: null,
    time_field: null,
    is_parsed: null,
    file_name: null
};
