import * as moment from 'moment';

export class SourcesDatatable {
    constructor(
        public first: number,
        public rows: number,
        public sortField: string,
        public sortOrder: number,
        public started: string,
        public ended: string,
        public time_field: string,
        public is_parsed: boolean,
        public file_name: string
    ) {}
}

export const initialSourcesDatatable: SourcesDatatable = {
    first: 0,
    rows: 10,
    sortField: 'last_modified',
    sortOrder: -1,
    started: moment.utc().subtract(1, 'd').startOf('d').toISOString(),
    ended: moment.utc().startOf('d').toISOString(),
    time_field: 'data',
    is_parsed: null,
    file_name: null
};
