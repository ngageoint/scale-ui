import { Action } from '@ngrx/store';

import { RecipesDatatableOptions} from './recipes-datatable-options.model';

export const UPDATE_RECIPES_DATATABLE = '[RecipesDatatableOptions] UPDATE_RECIPES_DATATABLE';
export const RESET_RECIPES_DATATABLE = '[RecipesDatatableOptions] RESET_RECIPES_DATATABLE';

export class UpdateRecipesDatatable implements Action {
    readonly type = UPDATE_RECIPES_DATATABLE;
    constructor(public payload: RecipesDatatableOptions) {}
}

export class ResetRecipesDatatable implements Action {
    readonly type = RESET_RECIPES_DATATABLE;
}

export type All
= UpdateRecipesDatatable
| ResetRecipesDatatable;
