import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';

import { RecipesApiService } from './api.service';
import { Recipe } from './api.model';
import { RecipesDatatable } from './datatable.model';
import { RecipesDatatableService } from './datatable.service';

@Component({
    selector: 'app-recipes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipesComponent implements OnInit {
    datatableOptions: RecipesDatatable;
    recipes: Recipe[];
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private recipesDatatableService: RecipesDatatableService,
        private recipesApiService: RecipesApiService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.isInitialized = false;
    }

    private updateData() {
        this.recipesApiService.getRecipes(this.datatableOptions).then(data => {
            this.count = data.count;
            this.recipes = data.results as Recipe[];
        });
    }
    private updateOptions() {
        this.recipesDatatableService.setRecipesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/recipes'], {
            queryParams: this.datatableOptions
        });

        this.updateData();
    }

    paginate(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: e.first,
            rows: parseInt(e.rows, 10)
        });
        this.updateOptions();
    }
    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            this.datatableOptions = Object.assign(this.datatableOptions, {
                first: 0,
                sortField: e.sortField,
                sortOrder: e.sortOrder,
                filters: e.filters
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    ngOnInit() {
        if (this.activatedRoute.snapshot &&
            Object.keys(this.activatedRoute.snapshot.queryParams).length > 0) {

            const params = this.activatedRoute.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                filters: params.filters,
                started: params.started,
                ended: params.ended,
                type_id: params.type_id,
                type_name: params.type_name,
                batch_id: params.batch_id,
                include_superseded: params.include_superseded
            };
        } else {
            this.datatableOptions = this.recipesDatatableService.getRecipesDatatableOptions();
        }
        this.updateOptions();
    }
}
