export class DatasetMemberDatatable {
    constructor(
        public first?: number,
        public rows?: number,
        public sortField?: string,
        public sortOrder?: number,
        public started?: string,
        public ended?: string,
        public status?: any,
        public file_name?: string
    ) {}
}

// export const initialDatasetMemberDatatable: DatasetMemberDatatable = {
//     first: 0,
//     rows: 20,
//     sortField: 'ingest_started',
//     sortOrder: -1,
//     started: null,
//     ended: null
// };
