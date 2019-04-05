import { Injectable } from '@angular/core';

import { initialBatchesDatatable, BatchesDatatable } from './datatable.model';

@Injectable()
export class BatchesDatatableService {
    batchesDatatable: BatchesDatatable;

    constructor() {
        this.batchesDatatable = initialBatchesDatatable;
    }

    getBatchesDatatableOptions(): BatchesDatatable {
        return this.batchesDatatable;
    }
    setBatchesDatatableOptions(params: BatchesDatatable): void {
        this.batchesDatatable = params;
    }
}
