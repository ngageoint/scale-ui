import * as moment from 'moment';

export class BatchesDatatable {
    constructor(
        public first?: number,
        public rows?: number,
        public sortField?: string,
        public sortOrder?: number,
        public started?: string,
        public ended?: string,
        public duration?: string,
        public recipe_type_name?: any,
        public is_creation_done?: any,
        public is_superseded?: any,
        public root_batch_id?: any
    ) {}
}

export const initialBatchesDatatable: BatchesDatatable = {
    first: 0,
    rows: 20,
    sortField: 'last_modified',
    sortOrder: -1,
    started: moment.utc().subtract(1, 'd').startOf('d').toISOString(),
    ended: moment.utc().endOf('d').toISOString(),
    duration: 'PT24H'
};
