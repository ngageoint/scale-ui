import * as moment from 'moment';

export class FailureRatesDatatable {
    constructor(
        public sortField: string,
        public sortOrder: number,
        public started: string,
        public ended: string,
        public name: string,
        public version: string,
        public category: string
    ) {}
}

export const initialFailureRatesDatatable: FailureRatesDatatable = {
    sortField: 'twentyfour_hours.failRate',
    sortOrder: -1,
    started: moment.utc().subtract(30, 'd').startOf('d').toISOString(),
    ended: moment.utc().add(1, 'd').startOf('d').toISOString(),
    name: null,
    version: null,
    category: null
};
