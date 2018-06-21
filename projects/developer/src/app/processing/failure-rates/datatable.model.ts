export class FailureRatesDatatable {
    constructor(
        public sortField: string,
        public sortOrder: number,
        public name: string,
        public version: string,
        public category: string
    ) {}
}

export const initialFailureRatesDatatable: FailureRatesDatatable = {
    sortField: 'twentyfour_hours.failRate',
    sortOrder: -1,
    name: null,
    version: null,
    category: null
};
