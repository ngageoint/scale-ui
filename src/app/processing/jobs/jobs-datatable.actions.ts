import { Action } from '@ngrx/store';

import { JobsDatatableOptions} from './jobs-datatable-options.model';

export const UPDATE_JOBS_DATATABLE = '[JobsDatatableOptions] UPDATE_JOBS_DATATABLE';
export const RESET_JOBS_DATATABLE = '[JobsDatatableOptions] RESET_JOBS_DATATABLE';

export class UpdateJobsDatatable implements Action {
    readonly type = UPDATE_JOBS_DATATABLE;
    constructor(public payload: JobsDatatableOptions) {}
}

export class ResetJobsDatatable implements Action {
    readonly type = RESET_JOBS_DATATABLE;
}

export type All
= UpdateJobsDatatable
| ResetJobsDatatable;
