import { Injectable } from '@angular/core';

import { initialRecipeTypesDatatable, RecipeTypesDatatable } from './datatable.model';

@Injectable()
export class RecipeTypesDatatableService {
    recipeTypesDatatable: RecipeTypesDatatable;

    constructor() {
        this.recipeTypesDatatable = initialRecipeTypesDatatable;
    }

    getRecipeTypesDatatableOptions(): RecipeTypesDatatable {
        return this.recipeTypesDatatable;
    }
    setRecipeTypesDatatableOptions(params: RecipeTypesDatatable): void {
        this.recipeTypesDatatable = params;
    }
}
