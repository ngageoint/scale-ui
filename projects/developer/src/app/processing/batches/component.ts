import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
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
    dateFormat = environment.dateFormat;
    selectedBatch: any;
    selectedRows: any;
    datatableLoading: boolean;
    datatableOptions: BatchesDatatable;
    columns = [
        { field: 'title', header: 'Title' },
        { field: 'recipe_type', header: 'Recipe Type' },
        { field: 'is_creation_done', header: 'Recipes' },
        { field: 'jobs_total', header: 'Jobs' },
        { field: 'created', header: 'Created (Z)' },
        { field: 'last_modified', header: 'Last Modified (Z)' }
    ];
    recipeTypes: any;
    recipeTypeOptions: SelectItem[];
    selectedRecipeType: any = [];
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
        private batchesDatatableService: BatchesDatatableService,
        private batchesApiService: BatchesApiService,
        private recipeTypesApiService: RecipeTypesApiService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        public breakpointObserver: BreakpointObserver
    ) {}

    private updateData() {
        this.datatableLoading = true;
        this.unsubscribe();
        this.subscription = this.batchesApiService.getBatches(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            _.forEach(data.results, result => {
                const batch = _.find(this.selectedRows, { data: { id: result.id } });
                result.selected =  !!batch;
            });
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
    }
    private getRecipeTypes() {
        this.selectedRecipeType = [];
        this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            this.recipeTypes = RecipeType.transformer(data.results);
            const selectItems = [];
            _.forEach(this.recipeTypes, recipeType => {
                selectItems.push({
                    label: recipeType.title,
                    value: recipeType
                });
                if (_.indexOf(this.datatableOptions.recipe_type_name, recipeType.name) >= 0) {
                    this.selectedRecipeType.push(recipeType);
                }
            });
            this.recipeTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
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
        const name = _.map(e.value, 'name');
        this.datatableOptions.recipe_type_name = name.length > 0 ? name : null;
        this.updateOptions();
    }
    onRowSelect(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0
        });
        if (!_.find(this.selectedRows, { data: { id: e.data.id } })) {
            this.dataService.setSelectedBatchRows(e);
        }
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/processing/batches/${e.data.id}`);
        } else {
            this.router.navigate([`/processing/batches/${e.data.id}`]);
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
        this.batches = null;
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
        this.batches = null;
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
    onFilterClick(e) {
        e.stopPropagation();
    }
    ngOnInit() {
        this.selectedRows = this.dataService.getSelectedBatchRows();

        this.breakpointObserver.observe(['(min-width: 1275px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });

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
                    duration: params.duration ? params.duration : null,
                    recipe_type_name: params.recipe_type_name ?
                        Array.isArray(params.recipe_type_name) ?
                            params.recipe_type_name :
                            [params.recipe_type_name]
                        : null,
                    is_creation_done: params.is_creation_done ? params.is_creation_done === 'true' : null,
                    is_superseded: params.is_superseded ? params.is_superseded === 'true' : null,
                    root_batch_id: params.root_batch_id ? +params.root_batch_id : null
                };
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
