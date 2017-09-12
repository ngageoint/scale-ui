import { Injectable } from '@angular/core';

import { initialJobsDatatable, JobsDatatable } from '../jobs/datatable.model';

@Injectable()
export class RunningJobsDatatableService {
    runningJobsDatatable: JobsDatatable;

    constructor() {
        this.runningJobsDatatable = Object.assign(initialJobsDatatable, {
            status: 'RUNNING'
        });
    }

    getRunningJobsDatatableOptions(): JobsDatatable {
        return this.runningJobsDatatable;
    }
    setRunningJobsDatatableOptions(params: JobsDatatable): void {
        this.runningJobsDatatable = params;
    }
}
