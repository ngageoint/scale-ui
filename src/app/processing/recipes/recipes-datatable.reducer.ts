import { RecipesDatatableOptions, initialRecipesDatatableOptions } from './recipes-datatable-options.model';
import * as RecipesDatatableActions from './recipes-datatable.actions';

export type Action = RecipesDatatableActions.All;

export function recipesDatatableReducer(state: RecipesDatatableOptions = initialRecipesDatatableOptions, action: Action) {
    switch (action.type) {
        case RecipesDatatableActions.UPDATE_RECIPES_DATATABLE: {
            return Object.assign({}, state, action.payload);
        }
        case RecipesDatatableActions.RESET_RECIPES_DATATABLE: {
            return Object.assign({}, state, initialRecipesDatatableOptions);
        }
        default: {
            return state;
        }
    }
}
