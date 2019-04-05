import { Injectable } from '@angular/core';

import { initialRunningJobsDatatable, RunningJobsDatatable } from './datatable.model';

@Injectable({
    providedIn: 'root'
})
export class RunningJobsDatatableService {
    runningJobsDatatable: RunningJobsDatatable;

    constructor() {
        this.runningJobsDatatable = initialRunningJobsDatatable;
    }

    getRunningJobsDatatableOptions(): RunningJobsDatatable {
        return this.runningJobsDatatable;
    }
    setRunningJobsDatatableOptions(params: RunningJobsDatatable): void {
        this.runningJobsDatatable = params;
    }
}
