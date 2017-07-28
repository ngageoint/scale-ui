import { Action } from '@ngrx/store';

import { RecipesDatatableOptions} from './recipes-datatable-options.model';

export const UPDATE_DATATABLE = '[JobsDatatableOptions] UPDATE_DATATABLE';
export const RESET = '[JobsDatatableOptions] RESET';

export class UpdateDatatable implements Action {
    readonly type = UPDATE_DATATABLE;
    constructor(public payload: RecipesDatatableOptions) {}
}

export class Reset implements Action {
    readonly type = RESET;
}

export type All
= UpdateDatatable
| Reset;
