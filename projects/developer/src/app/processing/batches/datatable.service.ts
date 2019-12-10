import { Injectable } from '@angular/core';

import { initialBatchesDatatable, BatchesDatatable } from './datatable.model';
import { LocalStorageItem } from '../../common/utils/localstorage';

@Injectable({
    providedIn: 'root'
})
export class BatchesDatatableService {
    batchesDatatable: BatchesDatatable;
    private storage: LocalStorageItem;

    constructor() {
        this.storage = new LocalStorageItem('datatable', 'processing-batches');
        const storageData = this.storage.get();

        this.batchesDatatable = storageData || initialBatchesDatatable;
    }

    getBatchesDatatableOptions(): BatchesDatatable {
        return this.batchesDatatable;
    }

    setBatchesDatatableOptions(params: BatchesDatatable): void {
        this.batchesDatatable = params;
        this.storage.set(params);
    }
}
