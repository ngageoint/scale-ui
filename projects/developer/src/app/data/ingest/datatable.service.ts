import { Injectable } from '@angular/core';

import { initialIngestDatatable, IngestDatatable } from './datatable.model';
import { LocalStorageItem } from '../../common/utils/localstorage';

@Injectable({
    providedIn: 'root'
})
export class IngestDatatableService {
    ingestDatatable: IngestDatatable;
    private storage: LocalStorageItem;

    constructor() {
        this.storage = new LocalStorageItem('datatable', 'data-ingest');
        const storageData = this.storage.get();

        this.ingestDatatable = storageData || initialIngestDatatable;
    }

    getIngestDatatableOptions(): IngestDatatable {
        return this.ingestDatatable;
    }

    setIngestDatatableOptions(params: IngestDatatable): void {
        this.ingestDatatable = params;

        // don't let started/ended params persist in local storage
        delete params.started;
        delete params.ended;
        this.storage.set(params);
    }
}
