import { Injectable } from '@angular/core';

import { initialJobTypesDatatable, JobTypesDatatable } from '../../configuration/job-types/datatable.model';

@Injectable()
export class FailureRatesDatatableService {
    jobTypesDatatable: JobTypesDatatable;

    constructor() {
        this.jobTypesDatatable = initialJobTypesDatatable;
    }

    getFailureRatesDatatableOptions(): JobTypesDatatable {
        return this.jobTypesDatatable;
    }
    setFailureRatesDatatableOptions(params: JobTypesDatatable): void {
        this.jobTypesDatatable = params;
    }
}
