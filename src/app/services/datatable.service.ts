import { Injectable } from '@angular/core';

import { initialJobsDatatableOptions, JobsDatatableOptions } from '../processing/jobs/jobs-datatable-options.model';
import { initialRecipesDatatableOptions, RecipesDatatableOptions } from '../processing/recipes/recipes-datatable-options.model';
import { initialJobTypesDatatableOptions, JobTypesDatatableOptions } from '../processing/job-types/job-types-datatable-options.model';

@Injectable()
export class DatatableService {
    jobsDatatableOptions: JobsDatatableOptions;
    recipesDatatableOptions: RecipesDatatableOptions;
    jobTypesDatatableOptions: JobTypesDatatableOptions;

    constructor() {
        this.jobsDatatableOptions = initialJobsDatatableOptions;
        this.recipesDatatableOptions = initialRecipesDatatableOptions;
        this.jobTypesDatatableOptions = initialJobTypesDatatableOptions;
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
    getJobTypesDatatableOptions(): JobTypesDatatableOptions {
        return this.jobTypesDatatableOptions;
    }
    setJobTypesDatatableOptions(params: JobTypesDatatableOptions): void {
        this.jobTypesDatatableOptions = params;
    }
}
