import * as moment from 'moment';

export class IngestDatatable {
    constructor(
        public first?: number,
        public rows?: number,
        public sortField?: string,
        public sortOrder?: number,
        public started?: string,
        public ended?: string,
        public status?: any,
        public scan_id?: any,
        public strike_id?: any,
        public file_name?: string
    ) {}
}

export const initialIngestDatatable: IngestDatatable = {
    first: 0,
    rows: 20,
    sortField: 'ingest_started',
    sortOrder: -1,
    started: moment.utc().subtract(1, 'd').startOf('d').toISOString(),
    ended: moment.utc().endOf('d').toISOString()
};
