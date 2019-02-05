import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';
import * as moment from 'moment';

import { environment } from '../../../environments/environment';
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
    dateFormat: string = environment.dateFormat;
    datatableOptions: RecipesDatatable;
    datatableLoading: boolean;
    columns: any[];
    recipes: any;
    recipeTypes: RecipeType[];
    recipeTypeOptions: SelectItem[];
    selectedRecipe: Recipe;
    selectedRecipeType: any = [];
    selectedRows: any;
    first: number;
    count: number;
    started: string;
    ended: string;
    isInitialized: boolean;
    subscription: any;
    applyBtnClass = 'ui-button-secondary';

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
        this.selectedRows = this.dataService.getSelectedRecipeRows();
        this.datatableOptions = recipesDatatableService.getRecipesDatatableOptions();
    }

    private updateData() {
        this.datatableLoading = true;
        this.unsubscribe();
        this.subscription = this.recipesApiService.getRecipes(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            _.forEach(data.results, result => {
                const recipe = _.find(this.selectedRows, { data: { id: result.id } });
                result.selected =  !!recipe;
            });
            this.recipes = Recipe.transformer(data.results);
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving recipes', detail: err.statusText});
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        }) as RecipesDatatable;
        this.recipesDatatableService.setRecipesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/recipes'], {
            queryParams: this.datatableOptions as Params,
            replaceUrl: true
        });

        this.updateData();
    }
    private getRecipeTypes() {
        this.selectedRecipeType = [];
        this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            this.recipeTypes = data.results as RecipeType[];
            const selectItems = [];
            _.forEach(this.recipeTypes, (recipeType: any) => {
                selectItems.push({
                    label: `${recipeType.title}`,
                    value: recipeType
                });
                if (_.indexOf(this.datatableOptions.type_name, recipeType.name) >= 0) {
                    this.selectedRecipeType.push(recipeType);
                }
            });
            this.recipeTypeOptions = _.orderBy(selectItems, 'label', 'asc');
            this.updateOptions();
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving recipe types', detail: err.statusText});
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
        const name = _.map(e.value, 'name');
        this.datatableOptions.type_name = name.length > 0 ? name : null;
        this.updateOptions();
    }
    onRowSelect(e) {
        if (!_.find(this.selectedRows, { data: { id: e.data.id } })) {
            this.dataService.setSelectedRecipeRows(e);
        }
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/processing/recipes/${e.data.id}`);
        } else {
            this.router.navigate([`/processing/recipes/${e.data.id}`]);
        }
    }
    onStartSelect(e) {
        this.started = moment.utc(e, this.dateFormat).startOf('d').format(this.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }
    onEndSelect(e) {
        this.ended = moment.utc(e, this.dateFormat).endOf('d').format(this.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }
    onDateFilterApply() {
        this.recipes = null;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: moment.utc(this.started, this.dateFormat).toISOString(),
            ended: moment.utc(this.ended, this.dateFormat).toISOString()
        });
        this.applyBtnClass = 'ui-button-secondary';
        this.updateOptions();
    }
    setDateFilterRange(unit: any, range: any) {
        this.started = moment.utc().subtract(range, unit).toISOString();
        this.ended = moment.utc().toISOString();
        this.onDateFilterApply();
    }
    onClick(e) {
        e.stopPropagation();
    }
    ngOnInit() {
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
                    type_name: params.type_name ?
                        Array.isArray(params.type_name) ?
                            params.type_name :
                            [params.type_name]
                        : null,
                    batch_id: +params.batch_id || null,
                    include_superseded: params.include_superseded || null
                };
            } else {
                this.datatableOptions = this.recipesDatatableService.getRecipesDatatableOptions();
            }
            this.started = moment.utc(this.datatableOptions.started).format(this.dateFormat);
            this.ended = moment.utc(this.datatableOptions.ended).format(this.dateFormat);
            this.getRecipeTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
