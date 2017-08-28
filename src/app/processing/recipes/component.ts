import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';

import { RecipesApiService } from './api.service';
import { Recipe } from './api.model';
import { RecipeType } from '../../configuration/recipe-types/api.model';
import { RecipesDatatable } from './datatable.model';
import { RecipesDatatableService } from './datatable.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';

@Component({
    selector: 'app-recipes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipesComponent implements OnInit {
    datatableOptions: RecipesDatatable;
    recipes: Recipe[];
    recipeTypes: RecipeType[];
    recipeTypeOptions: SelectItem[];
    selectedRecipe: Recipe;
    selectedRecipeType: string;
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private recipesDatatableService: RecipesDatatableService,
        private recipesApiService: RecipesApiService,
        private recipeTypesApiService: RecipeTypesApiService,
        private router: Router,
        private route: ActivatedRoute
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
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        this.recipesDatatableService.setRecipesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/recipes'], {
            queryParams: this.datatableOptions
        });

        this.updateData();
    }
    private getRecipeTypes() {
        this.recipeTypesApiService.getRecipeTypes().then(data => {
            this.recipeTypes = data.results as RecipeType[];
            const self = this;
            const selectItems = [];
            _.forEach(this.recipeTypes, function (recipeType) {
                selectItems.push({
                    label: recipeType.title + ' ' + recipeType.version,
                    value: recipeType.name
                });
                if (self.datatableOptions.type_name === recipeType.name) {
                    self.selectedRecipeType = recipeType.name;
                }
            });
            this.recipeTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
            this.recipeTypeOptions.unshift({
                label: 'All',
                value: ''
            });
            this.updateOptions();
        });
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
                sortOrder: e.sortOrder
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onChange(e) {
        e.originalEvent.preventDefault();
        this.datatableOptions = Object.assign(this.datatableOptions, {
            type_name: e.value
        });
        this.updateOptions();
    }
    onRowSelect(e) {
        this.router.navigate(['/processing/recipes/' + e.data.id]);
    }
    ngOnInit() {
        if (this.route.snapshot &&
            Object.keys(this.route.snapshot.queryParams).length > 0) {

            const params = this.route.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
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
        this.getRecipeTypes();
    }
}
