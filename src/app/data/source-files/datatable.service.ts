import { Injectable } from '@angular/core';

import { initialSourceFilesDatatable, SourceFilesDatatable } from './datatable.model';

@Injectable()
export class SourceFilesDatatableService {
    sourceFilesDatatable: SourceFilesDatatable;

    constructor() {
        this.sourceFilesDatatable = initialSourceFilesDatatable;
    }

    getSourceFilesDatatableOptions(): SourceFilesDatatable {
        return this.sourceFilesDatatable;
    }
    setSourceFilesDatatableOptions(params: SourceFilesDatatable): void {
        this.sourceFilesDatatable = params;
    }
}
