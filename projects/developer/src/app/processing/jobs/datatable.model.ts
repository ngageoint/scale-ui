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
        public job_type_id?: any,
        public job_type_name?: string,
        public job_type_category?: string,
        public batch_id?: number,
        public error_category?: string,
        public include_superseded?: boolean
    ) {}
}

export const initialJobsDatatable: JobsDatatable = {
    first: 0,
    rows: 20,
    sortField: 'last_modified',
    sortOrder: -1,
    started: moment.utc().subtract(1, 'd').startOf('d').toISOString(),
    ended: moment.utc().endOf('d').toISOString()
};
