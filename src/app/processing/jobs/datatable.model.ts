import * as moment from 'moment';

export class JobsDatatable {
    constructor(
        public first: number,
        public rows: number,
        public sortField: string,
        public sortOrder: number,
        public started: string,
        public ended: string,
        public status: string,
        public job_id: number,
        public job_type_id: any,
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
    started: moment.utc().subtract(1, 'd').toISOString(),
    ended: moment.utc().toISOString(),
    status: null,
    job_id: null,
    job_type_id: null,
    job_type_name: null,
    job_type_category: null,
    batch_id: null,
    error_category: null,
    include_superseded: null
};
