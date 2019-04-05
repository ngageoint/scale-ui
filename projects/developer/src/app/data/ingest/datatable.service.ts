import { Injectable } from '@angular/core';

import { initialIngestDatatable, IngestDatatable } from './datatable.model';

@Injectable({
    providedIn: 'root'
})
export class IngestDatatableService {
    ingestDatatable: IngestDatatable;

    constructor() {
        this.ingestDatatable = initialIngestDatatable;
    }

    getIngestDatatableOptions(): IngestDatatable {
        return this.ingestDatatable;
    }

    setIngestDatatableOptions(params: IngestDatatable): void {
        this.ingestDatatable = params;
    }
}
