import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { JobsDatatableOptions } from './jobs/jobs-datatable-options.model';
import { RecipesDatatableOptions } from './recipes/recipes-datatable-options.model';
import { Observable } from 'rxjs/Observable';

interface DatatableState {
    jobsDatatableOptions: JobsDatatableOptions,
    recipesDatatableOptions: RecipesDatatableOptions
}

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})
export class ProcessingComponent implements OnInit {
    jobsDatatableOptionsState: Observable<JobsDatatableOptions>;
    jobsDatatableOptions: JobsDatatableOptions;
    recipesDatatableOptionsState: Observable<RecipesDatatableOptions>;
    recipesDatatableOptions: RecipesDatatableOptions;
    constructor(
        private store: Store<DatatableState>
    ) {
        this.jobsDatatableOptionsState = store.select<JobsDatatableOptions>(s => s.jobsDatatableOptions);
        this.recipesDatatableOptionsState = store.select<RecipesDatatableOptions>(s => s.recipesDatatableOptions);
    }
    ngOnInit() {
        this.jobsDatatableOptionsState.subscribe((state) => {
            this.jobsDatatableOptions = state;
        });
        this.recipesDatatableOptionsState.subscribe((state) => {
            this.recipesDatatableOptions = state;
        });
    }
}
