import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';

import { RecipeService } from './recipes.service';
import { Recipe } from './recipe.model';
import { RecipesDatatableOptions } from './recipes-datatable-options.model';
import { DatatableService } from '../../services/datatable.service';

@Component({
    selector: 'app-recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.scss']
})

export class RecipesComponent implements OnInit {
    datatableOptions: RecipesDatatableOptions;
    recipes: Recipe[];
    first: number;
    count: number;

    constructor(
        private datatableService: DatatableService,
        private recipeService: RecipeService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    private updateData() {
        this.recipeService.getRecipes(this.datatableOptions).then(data => {
            this.count = data.count;
            this.recipes = data.results as Recipe[];
        });
    }
    private updateOptions() {
        this.datatableService.setRecipesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/recipes'], {
            queryParams: this.datatableOptions
        });

        this.updateData();
    }

    onSort(e: { field: string, order: number }) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            rows: 10,
            sortField: e.field,
            sortOrder: e.order
        });
        this.updateOptions();
    }
    paginate(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: e.first,
            rows: parseInt(e.rows, 10)
        });
        this.updateOptions();
    }
    onFilter(e: {filters: object, filteredValue: object[]}) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            filters: e.filters['recipe_type.title']['value']
        });
        this.updateOptions();
    }
    ngOnInit() {
        const params = this.activatedRoute.snapshot.queryParams;
        if (Object.keys(params).length > 0) {
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
            this.datatableOptions = this.datatableService.getRecipesDatatableOptions();
        }
        this.updateOptions();
    }
}
