import { Injectable } from '@angular/core';

import { initialJobTypeHistoryDatatable, JobTypeHistoryDatatable } from './datatable.model';

@Injectable({
    providedIn: 'root'
})
export class JobTypeHistoryDatatableService {
    jobTypeHistoryDatatable: JobTypeHistoryDatatable;

    constructor() {
        this.jobTypeHistoryDatatable = initialJobTypeHistoryDatatable;
    }

    getJobTypeHistoryDatatableOptions(): JobTypeHistoryDatatable {
        return this.jobTypeHistoryDatatable;
    }
    setJobTypeHistoryDatatableOptions(params: JobTypeHistoryDatatable): void {
        this.jobTypeHistoryDatatable = params;
    }
}
