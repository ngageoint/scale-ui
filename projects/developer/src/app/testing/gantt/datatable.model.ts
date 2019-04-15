import * as moment from 'moment';

export class JobsDatatable {
    constructor(
        public first?: number,
        public rows?: number,
        public sortField?: string,
        public sortOrder?: number,
        public started?: string,
        public ended?: string,
        public status?: any,
        public job_id?: number,
        public job_type_name?: any,
        public job_type_version?: any,
        public job_type_category?: string,
        public batch_id?: number,
        public error_category?: any,
        public include_superseded?: boolean
    ) {}
}

export const initialJobsDatatable: JobsDatatable = {
    first: 0,
    rows: 20,
    sortField: 'last_modified',
    sortOrder: -1,
    started: moment.utc().subtract(24, 'h').toISOString(),
    ended: moment.utc().toISOString(),
    job_type_name: []
};
