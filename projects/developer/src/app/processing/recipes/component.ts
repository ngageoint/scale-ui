import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import * as _ from 'lodash';

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
        { field: 'duration', header: 'Duration', sortableColumnDisabled: true },
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
    isMobile: boolean;
    liveRange: number;

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
        this.unsubscribe();

        // don't show loading state when in live mode
        if (!this.liveRange) {
            this.datatableLoading = true;
        }

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

        // update router params
        const params = this.datatableOptions as Params;
        if (params.liveRange) {
            // if live range was set on the table options, remove started/ended
            delete params.started;
            delete params.ended;
        } else {
            // live range not provided, default back to started/ended set on table options
            params.started = params.started || this.started;
            params.ended = params.ended || this.ended;
        }

        // update querystring
        this.router.navigate(['/processing/recipes'], {
            queryParams: params,
            replaceUrl: true
        });
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
            this.updateData();
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
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey || e.originalEvent.which === 2) {
            window.open(`/processing/recipes/${e.data.id}`);
        } else {
            this.router.navigate([`/processing/recipes/${e.data.id}`]);
        }
    }

    /**
     * Callback for temporal filter updating the start/end range filter.
     * @param data start and end strings of iso formatted datetimes
     */
    onDateFilterSelected(data: {start: string, end: string}): void {
        // keep local model in sync
        this.started = data.start;
        this.ended = data.end;
        // patch in the values to the datatable
        this.datatableOptions = Object.assign(this.datatableOptions, {
            started: data.start,
            ended: data.end
        });
        // update router
        this.updateOptions();
    }

    /**
     * Callback for temporal filter updating the live range selection.
     * @param data hours that should be used, or null to clear
     */
    onLiveRangeSelected(data: {hours: number}): void {
        // keep model in sync
        this.liveRange = data.hours;
        // patch in the values for datatable
        this.datatableOptions = Object.assign(this.datatableOptions, {
            liveRange: data.hours
        });
        // update router
        this.updateOptions();
    }

    /**
     * Callback for when temporal filter tells this component to update visible date range. This is
     * the signal that either a date range or a live range is being triggered.
     * @param data start and end iso strings for what dates should be filtered
     */
    onTemporalFilterUpdate(data: {start: string, end: string}): void {
        // update the datatable options then call the api
        this.datatableOptions = Object.assign(this.datatableOptions, {
                first: 0,
                started: data.start,
                ended: data.end
            });
        this.updateData();
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
        // let temporal filter set the start/end
        this.datatableOptions.started = null;
        this.datatableOptions.ended = null;

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: +params.first || 0,
                    rows: +params.rows || 10,
                    sortField: params.sortField || 'last_modified',
                    sortOrder: +params.sortOrder || -1,
                    started: params.started || this.datatableOptions.started,
                    ended: params.ended || this.datatableOptions.ended,
                    liveRange: params.liveRange ? parseInt(params.liveRange, 10) : null,
                    duration: params.duration ? params.duration : null,
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
            this.started = this.datatableOptions.started;
            this.ended = this.datatableOptions.ended;
            this.liveRange = this.datatableOptions.liveRange;
            this.getRecipeTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
