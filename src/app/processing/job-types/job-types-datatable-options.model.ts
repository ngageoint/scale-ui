export class JobTypesDatatableOptions {
    constructor(
        public first: number,
        public rows: number,
        public sortField: string,
        public sortOrder: number,
        public filters: object
    ) {}
}

export const initialJobTypesDatatableOptions: JobTypesDatatableOptions = {
    first: 0,
    rows: 10,
    sortField: 'title',
    sortOrder: 1,
    filters: null
};
