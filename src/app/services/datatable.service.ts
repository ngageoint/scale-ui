import { Injectable } from '@angular/core';

import { initialJobsDatatableOptions, JobsDatatableOptions } from '../processing/jobs/jobs-datatable-options.model';
import { initialRecipesDatatableOptions, RecipesDatatableOptions } from '../processing/recipes/recipes-datatable-options.model';

@Injectable()
export class DatatableService {
    jobsDatatableOptions: JobsDatatableOptions;
    recipesDatatableOptions: RecipesDatatableOptions;

    constructor() {
        this.jobsDatatableOptions = initialJobsDatatableOptions;
        this.recipesDatatableOptions = initialRecipesDatatableOptions;
    }

    getJobsDatatableOptions(): JobsDatatableOptions {
        return this.jobsDatatableOptions;
    }
    setJobsDatatableOptions(params: JobsDatatableOptions): void {
        this.jobsDatatableOptions = params;
    }
    getRecipesDatatableOptions(): RecipesDatatableOptions {
        return this.recipesDatatableOptions;
    }
    setRecipesDatatableOptions(params: RecipesDatatableOptions): void {
        this.recipesDatatableOptions = params;
    }
}
