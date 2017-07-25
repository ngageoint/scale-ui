export class JobsDatatableOptions {
    constructor(
        first: number,
        rows: number,
        sortField: string,
        sortOrder: number,
        filters: object
    ) {}
}

export const initialJobsDatatableOptions: JobsDatatableOptions = {
    first: 0,
    rows: 10,
    sortField: 'last_modified',
    sortOrder: -1,
    filters: null
};
