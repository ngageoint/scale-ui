import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { RecipeService } from './recipes.service';
import { Recipe } from './recipe.model';
import { initialRecipesDatatableOptions, RecipesDatatableOptions } from './recipes-datatable-options.model';
import { DatatableService } from '../../services/datatable.service';

@Component({
    selector: 'app-recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.scss']
})

export class RecipesComponent implements OnInit {
    datatableOptions: RecipesDatatableOptions;
    recipes: Recipe[];

    constructor(
        private recipeService: RecipeService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private datatableService: DatatableService
    ) { }

    private updateData() {
        this.recipeService.getRecipes(this.datatableOptions).then(recipes => this.recipes = recipes);
    }
    private updateOptions() {
        this.datatableService.setRecipesDatatableOptions(this.datatableOptions);

        // update querystring to trigger data update
        this.router.navigate(['/processing/recipes'], {
            queryParams: this.datatableOptions
        });
    }
    onSort(e: { field: string, order: number }) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            sortField: e.field,
            sortOrder: e.order,
            first: 0
        });
        this.updateOptions();
    }
    onPage(e: { first: number, rows: number }) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            page: e.first
        });
        this.updateOptions();
    }
    onFilter(e: { filters: object }) {
        console.log(e.filters);
        this.datatableOptions = Object.assign(this.datatableOptions, {
            filters: e.filters
        });
        this.updateOptions();
    }
    ngOnInit() {
        // set initial state and subscribe to query params
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            if (!this.datatableOptions) {
                if (Object.keys(params).length > 0) {
                    this.datatableOptions = {
                        first: parseInt(params.first, 10),
                        rows: parseInt(params.rows, 10),
                        sortField: params.sortField,
                        sortOrder: parseInt(params.sortOrder, 10),
                        filters: params.filters
                    };
                    this.datatableService.setRecipesDatatableOptions(this.datatableOptions);
                } else {
                    this.datatableOptions = initialRecipesDatatableOptions;
                }
            }
            this.updateOptions();
            this.updateData();
        });
    }
}
