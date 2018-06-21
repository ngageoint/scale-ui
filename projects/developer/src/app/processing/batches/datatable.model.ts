import * as moment from 'moment';

export class BatchesDatatable {
    constructor(
        public first?: number,
        public rows?: number,
        public sortField?: string,
        public sortOrder?: number,
        public started?: string,
        public ended?: string,
        public status?: any,
        public job_type_id?: any,
        public recipe_type_id?: any
    ) {}
}

export const initialBatchesDatatable: BatchesDatatable = {
    first: 0,
    rows: 20,
    sortField: 'last_modified',
    sortOrder: -1,
    started: moment.utc().subtract(1, 'd').startOf('d').toISOString(),
    ended: moment.utc().endOf('d').toISOString()
};
