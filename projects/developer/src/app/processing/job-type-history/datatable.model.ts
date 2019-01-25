export class JobTypeHistoryDatatable {
    constructor(
        public sortField: string,
        public sortOrder: number,
        public name: any,
        public version: any,
        public category: string
    ) {}
}

export const initialJobTypeHistoryDatatable: JobTypeHistoryDatatable = {
    sortField: 'twentyfour_hours.failRate',
    sortOrder: -1,
    name: null,
    version: null,
    category: null
};
