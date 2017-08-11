
export class DashboardDatatable {
    constructor(
        public first: number,
        public rows: number,
        public id: number,
        public started: string,
        public ended: string,
        public name: string,
        public category: string,
        public is_active: boolean,
        public is_operational: boolean
    ) {}
}

export const initialDatatable: DashboardDatatable = {
    first: 0,
    rows: 10,
    id: null,
    started: null,
    ended: null,
    name: null,
    category: null,
    is_active: null,
    is_operational: null
};
