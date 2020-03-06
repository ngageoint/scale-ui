import { Injectable } from '@angular/core';

import { initialScansDatatable, ScansDatatable } from './datatable.model';
import { LocalStorageItem } from '../../common/utils/localstorage';

@Injectable({
    providedIn: 'root'
})
export class ScansDatatableService {
    scansDatatable: ScansDatatable;
    private storage: LocalStorageItem;

    constructor() {
        this.storage = new LocalStorageItem('datatable', 'system-scans');
        const storageData = this.storage.get();

        this.scansDatatable = storageData || initialScansDatatable;
    }

    getScansDatatableOptions(): ScansDatatable {
        return this.scansDatatable;
    }

    setScansDatatableOptions(params: ScansDatatable): void {
        this.scansDatatable = params;

        // don't let started/ended params persist in local storage
        delete params.started;
        delete params.ended;
        this.storage.set(params);
    }
}
