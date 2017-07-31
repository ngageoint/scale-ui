import { Component, OnInit } from '@angular/core';
import { JobsDatatableOptions } from './jobs/jobs-datatable-options.model';
import { RecipesDatatableOptions } from './recipes/recipes-datatable-options.model';
import { DatatableService } from '../services/datatable.service';

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})

export class ProcessingComponent implements OnInit {
    jobsDatatableOptions: JobsDatatableOptions;
    recipesDatatableOptions: RecipesDatatableOptions;

    constructor(
        private datatableService: DatatableService
    ) { }

    ngOnInit() {
        this.jobsDatatableOptions = this.datatableService.getJobsDatatableOptions();
        this.recipesDatatableOptions = this.datatableService.getRecipesDatatableOptions();
    }
}
