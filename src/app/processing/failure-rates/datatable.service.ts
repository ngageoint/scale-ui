import { Injectable } from '@angular/core';

import { initialFailureRatesDatatable, FailureRatesDatatable } from './datatable.model';

@Injectable()
export class FailureRatesDatatableService {
    failureRatesDatatable: FailureRatesDatatable;

    constructor() {
        this.failureRatesDatatable = initialFailureRatesDatatable;
    }

    getFailureRatesDatatableOptions(): FailureRatesDatatable {
        return this.failureRatesDatatable;
    }
    setFailureRatesDatatableOptions(params: FailureRatesDatatable): void {
        this.failureRatesDatatable = params;
    }
}
