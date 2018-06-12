import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';
import * as moment from 'moment';

import { DataService } from '../../common/services/data.service';
import { RecipesApiService } from './api.service';
import { Recipe } from './api.model';
import { RecipeType } from '../../configuration/recipe-types/api.model';
import { RecipesDatatable } from './datatable.model';
import { RecipesDatatableService } from './datatable.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';

@Component({
    selector: 'dev-recipes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipesComponent implements OnInit, OnDestroy {
    datatableOptions: RecipesDatatable;
    datatableLoading: boolean;
    columns: any[];
    recipes: any;
    recipeTypes: RecipeType[];
    recipeTypeOptions: SelectItem[];
    selectedRecipe: Recipe;
    selectedRecipeType: string;
    first: number;
    count: number;
    started: string;
    ended: string;
    isInitialized: boolean;
    subscription: any;

    constructor(
        public dataService: DataService,
        private messageService: MessageService,
        private recipesDatatableService: RecipesDatatableService,
        private recipesApiService: RecipesApiService,
        private recipeTypesApiService: RecipeTypesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.columns = [
            { field: 'recipe_type.name', header: 'Recipe Type' },
            { field: 'created', header: 'Created (Z)' },
            { field: 'last_modified', header: 'Last Modified (Z)' },
            { field: 'duration', header: 'Duration' },
            { field: 'completed', header: 'Completed (Z)' }
        ];
        this.isInitialized = false;
        this.datatableOptions = recipesDatatableService.getRecipesDatatableOptions();
    }

    private updateData() {
        this.datatableLoading = true;
        this.unsubscribe();
        this.subscription = this.recipesApiService.getRecipes(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            this.recipes = Recipe.transformer(data.results);
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving recipes', detail: err.statusText});
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        this.recipesDatatableService.setRecipesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/recipes'], {
            queryParams: this.datatableOptions,
            replaceUrl: true
        });

        this.updateData();
    }
    private getRecipeTypes() {
        this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
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

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
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
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/processing/recipes/${e.data.id}`);
        } else {
            this.router.navigate([`/processing/recipes/${e.data.id}`]);
        }
    }
    onStartSelect(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: moment.utc(e, 'YYYY-MM-DD').toISOString()
        });
        this.updateOptions();
    }
    onEndSelect(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            ended: moment.utc(e, 'YYYY-MM-DD').toISOString()
        });
        this.updateOptions();
    }
    onClick(e) {
        e.stopPropagation();
    }
    ngOnInit() {
        this.datatableLoading = true;
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: +params.first || 0,
                    rows: +params.rows || 10,
                    sortField: params.sortField || 'last_modified',
                    sortOrder: +params.sortOrder || -1,
                    started: params.started ? params.started : moment.utc().subtract(1, 'd').startOf('h').toISOString(),
                    ended: params.ended ? params.ended : moment.utc().startOf('h').toISOString(),
                    type_id: +params.type_id || null,
                    type_name: params.type_name || null,
                    batch_id: +params.batch_id || null,
                    include_superseded: params.include_superseded || null
                };
            } else {
                this.datatableOptions = this.recipesDatatableService.getRecipesDatatableOptions();
            }
            this.started = moment.utc(this.datatableOptions.started).format('YYYY-MM-DD');
            this.ended = moment.utc(this.datatableOptions.ended).format('YYYY-MM-DD');
            this.getRecipeTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
