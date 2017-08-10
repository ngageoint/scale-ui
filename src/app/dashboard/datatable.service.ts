import { Injectable } from '@angular/core';

import { initialDatatable, DashboardDatatable } from './datatable.model';

@Injectable()
export class DashboardDatatableService {
    dashboardDatatable: DashboardDatatable;

    constructor() {
        this.dashboardDatatable = initialDatatable;
    }

    getDashboardDatatableOptions(): DashboardDatatable {
        return this.dashboardDatatable;
    }
    setDashboardDatatableOptions(params: DashboardDatatable): void {
        this.dashboardDatatable = params;
    }
}
