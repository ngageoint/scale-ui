export class RunningJobsDatatable {
    constructor(
        public first: number,
        public rows: number
    ) {}
}

export const initialRunningJobsDatatable: RunningJobsDatatable = {
    first: 0,
    rows: 10
};
