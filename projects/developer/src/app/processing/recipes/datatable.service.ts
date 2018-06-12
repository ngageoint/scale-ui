import { Injectable } from '@angular/core';

import { initialRecipesDatatable, RecipesDatatable } from './datatable.model';

@Injectable()
export class RecipesDatatableService {
    recipesDatatable: RecipesDatatable;

    constructor() {
        this.recipesDatatable = initialRecipesDatatable;
    }

    getRecipesDatatableOptions(): RecipesDatatable {
        return this.recipesDatatable;
    }
    setRecipesDatatableOptions(params: RecipesDatatable): void {
        this.recipesDatatable = params;
    }
}
