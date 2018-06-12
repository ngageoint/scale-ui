import { Injectable } from '@angular/core';

import { initialJobsDatatable, JobsDatatable } from './datatable.model';

@Injectable()
export class JobsDatatableService {
    jobsDatatable: JobsDatatable;

    constructor() {
        this.jobsDatatable = initialJobsDatatable;
    }

    getJobsDatatableOptions(): JobsDatatable {
        return this.jobsDatatable;
    }
    setJobsDatatableOptions(params: JobsDatatable): void {
        this.jobsDatatable = params;
    }
}
