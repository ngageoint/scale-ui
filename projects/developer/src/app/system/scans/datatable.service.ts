import { Injectable } from '@angular/core';

import { initialScansDatatable, ScansDatatable } from './datatable.model';

@Injectable()
export class ScansDatatableService {
    scansDatatable: ScansDatatable;

    constructor() {
        this.scansDatatable = initialScansDatatable;
    }

    getScansDatatableOptions(): ScansDatatable {
        return this.scansDatatable;
    }
    setScansDatatableOptions(params: ScansDatatable): void {
        this.scansDatatable = params;
    }
}
