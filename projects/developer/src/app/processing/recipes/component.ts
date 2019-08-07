import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
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
    datatableOptions: RecipesDatatable;
    datatableLoading: boolean;
    columns = [
        { field: 'recipe_type.name', header: 'Recipe Type' },
        { field: 'created', header: 'Created (Z)' },
        { field: 'last_modified', header: 'Last Modified (Z)' },
        { field: 'duration', header: 'Duration' },
        { field: 'completed', header: 'Completed (Z)' }
    ];
    dateFormat = environment.dateFormat;
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
    isInitialized = false;
    subscription: any;
    applyBtnClass = 'ui-button-secondary';
    isMobile: boolean;
    selectedDateRange: any;

    constructor(
        private dataService: DataService,
        private messageService: MessageService,
        private recipesDatatableService: RecipesDatatableService,
        private recipesApiService: RecipesApiService,
        private recipeTypesApiService: RecipeTypesApiService,
        private router: Router,
        private route: ActivatedRoute,
        private breakpointObserver: BreakpointObserver
    ) {}

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
                if (_.indexOf(this.datatableOptions.recipe_type_name, recipeType.name) >= 0) {
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
        this.datatableOptions.recipe_type_name = name.length > 0 ? name : null;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0
        });
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
        this.started = moment.utc(e, environment.dateFormat).startOf('d').format(environment.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }
    onEndSelect(e) {
        this.ended = moment.utc(e, environment.dateFormat).endOf('d').format(environment.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }
    onDateFilterApply(data: any) {
        this.recipes = null;
        this.started = data.started;
        this.ended = data.ended;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: moment.utc(this.started, environment.dateFormat).toISOString(),
            ended: moment.utc(this.ended, environment.dateFormat).toISOString()
        });
        this.updateOptions();
    }
    onDateRangeSelected(data: any) {
        this.recipes = null;
        this.started = moment.utc().subtract(data.range, data.unit).toISOString();
        this.ended = moment.utc().toISOString();
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: this.started,
            ended: this.ended,
            duration: moment.duration(data.range, data.unit).toISOString()
        });
        this.updateOptions();
    }
    onClick(e) {
        e.stopPropagation();
    }
    ngOnInit() {
        this.selectedRows = this.dataService.getSelectedRecipeRows();

        this.breakpointObserver.observe(['(min-width: 1220px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });

        this.datatableOptions = this.recipesDatatableService.getRecipesDatatableOptions();
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: +params.first || 0,
                    rows: +params.rows || 10,
                    sortField: params.sortField || 'last_modified',
                    sortOrder: +params.sortOrder || -1,
                    started: params.started ? params.started : moment.utc().subtract(1, 'd').startOf('h').toISOString(),
                    ended: params.ended ? params.ended : moment.utc().startOf('h').toISOString(),
                    recipe_type_id: +params.recipe_type_id || null,
                    recipe_type_name: params.recipe_type_name ?
                        Array.isArray(params.recipe_type_name) ?
                            params.recipe_type_name :
                            [params.recipe_type_name]
                        : null,
                    batch_id: +params.batch_id || null,
                    is_superseded: params.is_superseded || null
                };
            } else {
                this.datatableOptions = this.recipesDatatableService.getRecipesDatatableOptions();
            }
            this.started = moment.utc(this.datatableOptions.started).format(environment.dateFormat);
            this.ended = moment.utc(this.datatableOptions.ended).format(environment.dateFormat);
            this.getRecipeTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
