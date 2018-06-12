import { Injectable } from '@angular/core';

import { initialSourcesDatatable, SourcesDatatable } from './datatable.model';

@Injectable()
export class SourcesDatatableService {
    sourcesDatatable: SourcesDatatable;

    constructor() {
        this.sourcesDatatable = initialSourcesDatatable;
    }

    getSourcesDatatableOptions(): SourcesDatatable {
        return this.sourcesDatatable;
    }
    setSourcesDatatableOptions(params: SourcesDatatable): void {
        this.sourcesDatatable = params;
    }
}
