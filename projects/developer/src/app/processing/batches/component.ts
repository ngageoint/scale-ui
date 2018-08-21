import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';

import { DataService } from '../../common/services/data.service';
import { BatchesApiService } from './api.service';
import { Batch } from './api.model';
import { BatchesDatatable } from './datatable.model';
import { BatchesDatatableService } from './datatable.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';

@Component({
    selector: 'dev-batches',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class BatchesComponent implements OnInit, OnDestroy {
    batches: any;
    selectedBatch: any;
    datatableLoading: boolean;
    datatableOptions: BatchesDatatable;
    columns: any[];
    recipeTypes: any;
    recipeTypeOptions: SelectItem[];
    selectedRecipeType: string;
    count: number;
    started: string;
    ended: string;
    isInitialized: boolean;
    subscription: any;

    constructor(
        private dataService: DataService,
        private batchesDatatableService: BatchesDatatableService,
        private batchesApiService: BatchesApiService,
        private recipeTypesApiService: RecipeTypesApiService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {
        this.isInitialized = false;
        this.columns = [
            { field: 'title', header: 'Title' },
            { field: 'recipe_type.name', header: 'Recipe Type' },
            { field: 'is_creation_done', header: 'Creation Done' },
            { field: 'jobs_total', header: 'Total Jobs' },
            { field: 'recipes_total', header: 'Total Recipes' },
            { field: 'created', header: 'Created (Z)' },
            { field: 'last_modified', header: 'Last Modified (Z)' }
        ];
    }

    private updateData() {
        this.datatableLoading = true;
        this.unsubscribe();
        this.subscription = this.batchesApiService.getBatches(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            this.batches = Batch.transformer(data.results);
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving batches', detail: err.statusText});
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });

        this.batchesDatatableService.setBatchesDatatableOptions(this.datatableOptions);
        this.router.navigate(['/processing/batches'], {
            queryParams: this.datatableOptions,
            replaceUrl: true
        });

        this.updateData();
    }
    private getRecipeTypes() {
        this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            this.recipeTypes = RecipeType.transformer(data.results);
            const selectItems = [];
            _.forEach(this.recipeTypes, recipeType => {
                selectItems.push({
                    label: recipeType.title + ' ' + recipeType.version,
                    value: recipeType.id
                });
                if (this.datatableOptions.recipe_type_id === recipeType.id) {
                    this.selectedRecipeType = recipeType.id;
                }
            });
            this.recipeTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
            this.recipeTypeOptions.unshift({
                label: 'View All',
                value: ''
            });
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
            if (e.sortField !== this.datatableOptions.sortField || e.sortOrder !== this.datatableOptions.sortOrder) {
                this.datatableOptions = Object.assign(this.datatableOptions, {
                    first: 0,
                    sortField: e.sortField,
                    sortOrder: e.sortOrder
                });
            }
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onRecipeTypeChange(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            recipe_type_id: e.value
        });
        this.updateOptions();
    }
    onRowSelect(e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/processing/batches/${e.data.id}`);
        } else {
            this.router.navigate([`/processing/batches/${e.data.id}`]);
        }
    }
    onStartSelect(e) {
        this.started = e;
    }
    onEndSelect(e) {
        this.ended = e;
    }
    onDateFilterApply() {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: moment.utc(this.started, 'YYYY-MM-DD').startOf('d').toISOString(),
            ended: moment.utc(this.ended, 'YYYY-MM-DD').endOf('d').toISOString()
        });
        this.updateOptions();
    }
    onFilterClick(e) {
        e.stopPropagation();
    }
    createBatch() {
        this.router.navigate(['/processing/batches/create']);
    }
    ngOnInit() {
        this.datatableLoading = true;
        if (!this.datatableOptions) {
            this.datatableOptions = this.batchesDatatableService.getBatchesDatatableOptions();
        }
        this.batches = [];
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: params.first ? parseInt(params.first, 10) : 0,
                    rows: params.rows ? parseInt(params.rows, 10) : 10,
                    sortField: params.sortField ? params.sortField : 'last_modified',
                    sortOrder: params.sortOrder ? parseInt(params.sortOrder, 10) : -1,
                    started: params.started ? params.started : moment.utc().subtract(1, 'd').startOf('d').toISOString(),
                    ended: params.ended ? params.ended : moment.utc().endOf('d').toISOString(),
                    recipe_type_id: params.recipe_type_id ? parseInt(params.recipe_type_id, 10) : null,
                    is_creation_done: params.is_creation_done ? params.is_creation_done === 'true' : null,
                    is_superseded: params.is_superseded ? params.is_superseded === 'true' : null,
                    root_batch_id: params.root_batch_id ? +params.root_batch_id : null
                };
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
