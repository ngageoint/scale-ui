import * as moment from 'moment';

export class ScansDatatable {
    constructor(
        public first?: number,
        public rows?: number,
        public sortField?: string,
        public sortOrder?: number,
        public started?: string,
        public ended?: string,
        public duration?: string,
        public name?: any
    ) {}
}

export const initialScansDatatable: ScansDatatable = {
    first: 0,
    rows: 20,
    sortField: 'last_modified',
    sortOrder: -1,
    started: moment.utc().subtract(24, 'h').toISOString(),
    ended: moment.utc().toISOString(),
    name: []
};
