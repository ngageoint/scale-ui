import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { RecipeService } from './recipes.service';
import { Recipe } from './recipe.model';
import { RecipesDatatableOptions } from './recipes-datatable-options.model';
import { UPDATE_RECIPES_DATATABLE } from './recipes-datatable.actions';

interface DatatableState {
    recipesDatatableOptions: RecipesDatatableOptions
}

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {
    datatableOptionsState: Observable<RecipesDatatableOptions>;
    datatableOptions: RecipesDatatableOptions;
    recipes: Recipe[];

    constructor(
        private recipeService: RecipeService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private store: Store<DatatableState>
    ) {
        this.datatableOptionsState = store.select<RecipesDatatableOptions>(s => s.recipesDatatableOptions);
    }

    private updateData() {
        // console.log(this.datatableOptions);
        this.recipeService.getRecipes(this.datatableOptions).then(recipes => this.recipes = recipes);
    }
    onSort(e: { field: string, order: number }) {
        this.router.navigate(['/processing/recipes'], {
            queryParams: Object.assign(this.datatableOptions, {
                sortField: e.field,
                sortOrder: e.order,
                first: 0
            })
        });
    }
    onPage(e: { first: number, rows: number }) {
        this.router.navigate(['/processing/recipes'], {
            queryParams: Object.assign(this.datatableOptions, {
                page: e.first
            })
        });
    }
    onFilter(e: { filters: object }) {
        console.log(e.filters);
        this.router.navigate(['/processing/recipes'], {
            queryParams: Object.assign(this.datatableOptions, {
                filters: e.filters
            })
        });
    }
    ngOnInit() {
        // set initial state
        this.datatableOptionsState.subscribe((state) => {
            this.datatableOptions = state;
        });
        // subscribe to query params to update state
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.store.dispatch({
                type: UPDATE_RECIPES_DATATABLE,
                payload: params
            });
            this.updateData();
        });
        // this.updateData();
    }

}
