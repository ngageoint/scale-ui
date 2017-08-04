export class JobsDatatable {
    constructor(
        public first: number,
        public rows: number,
        public sortField: string,
        public sortOrder: number,
        public started: Date,
        public ended: Date,
        public status: string,
        public job_id: number,
        public job_type_id: number,
        public job_type_name: string,
        public job_type_category: string,
        public batch_id: number,
        public error_category: string,
        public include_superseded: boolean
    ) {}
}

export const initialJobsDatatable: JobsDatatable = {
    first: 0,
    rows: 10,
    sortField: 'last_modified',
    sortOrder: -1,
    started: null,
    ended: null,
    status: null,
    job_id: null,
    job_type_id: null,
    job_type_name: null,
    job_type_category: null,
    batch_id: null,
    error_category: null,
    include_superseded: null
};
