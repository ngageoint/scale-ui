import { Injectable } from '@angular/core';

import { initialJobsDatatable, JobsDatatable } from './datatable.model';
import { LocalStorageItem } from '../../common/utils/localstorage';

@Injectable({
    providedIn: 'root'
})
export class JobsDatatableService {
    jobsDatatable: JobsDatatable;
    private storage: LocalStorageItem;

    constructor() {
        this.storage = new LocalStorageItem('datatable', 'processing-jobs');
        const storageData = this.storage.get();

        this.jobsDatatable = storageData || initialJobsDatatable;
    }

    getJobsDatatableOptions(): JobsDatatable {
        return this.jobsDatatable;
    }

    setJobsDatatableOptions(params: JobsDatatable): void {
        this.jobsDatatable = params;
        this.storage.set(params);
    }
}
