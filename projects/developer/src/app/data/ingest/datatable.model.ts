export class IngestDatatable {
    constructor(
        public first?: number,
        public rows?: number,
        public sortField?: string,
        public sortOrder?: number,
        public started?: string,
        public ended?: string,
        public liveRange?: number,
        public duration?: string,
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
    started: null,
    ended: null
};
