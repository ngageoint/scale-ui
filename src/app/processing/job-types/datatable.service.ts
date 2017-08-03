import { Injectable } from '@angular/core';

import { initialJobTypesDatatable, JobTypesDatatable } from './datatable.model';

@Injectable()
export class JobTypesDatatableService {
    jobTypesDatatable: JobTypesDatatable

    constructor() {
        this.jobTypesDatatable = initialJobTypesDatatable;
    }

    getJobTypesDatatableOptions(): JobTypesDatatable {
        return this.jobTypesDatatable;
    }
    setJobTypesDatatableOptions(params: JobTypesDatatable): void {
        this.jobTypesDatatable = params;
    }
}
