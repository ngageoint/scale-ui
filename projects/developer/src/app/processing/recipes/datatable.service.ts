import { Injectable } from '@angular/core';

import { initialRecipesDatatable, RecipesDatatable } from './datatable.model';
import { LocalStorageItem } from '../../common/utils/localstorage';

@Injectable({
    providedIn: 'root'
})
export class RecipesDatatableService {
    recipesDatatable: RecipesDatatable;
    private storage: LocalStorageItem;

    constructor() {
        this.storage = new LocalStorageItem('datatable', 'processing-recipes');
        const storageData = this.storage.get();

        this.recipesDatatable = storageData || initialRecipesDatatable;
    }

    getRecipesDatatableOptions(): RecipesDatatable {
        return this.recipesDatatable;
    }

    setRecipesDatatableOptions(params: RecipesDatatable): void {
        this.recipesDatatable = params;

        // don't let started/ended params persist in local storage
        delete params.started;
        delete params.ended;
        this.storage.set(params);
    }
}
