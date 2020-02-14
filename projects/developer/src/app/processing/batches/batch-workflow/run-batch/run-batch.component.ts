import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
    BatchesApiService,
    IBatch,
    IBatchValidationResponse
} from './../../api.service';
import { Batch } from './../../api.model';
import { Dataset } from './../../../../data/models/dataset.model';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { skip, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'dev-run-batch',
    templateUrl: './run-batch.component.html',
    styleUrls: ['./run-batch.component.scss']
})
export class RunBatchComponent implements OnInit, OnDestroy {
    @Input() stepIndex: number;
    @Input() batch: Batch;
    @Input() batchDataset: Dataset;
    @Input() datasetFormOptions: any;
    newBatchPayload: IBatch;
    batchConfig: IDisplayConfig[] = [];
    datasetConfig: IDisplayConfig[] = [];
    validation$: Observable<IBatchValidationResponse>;
    validation: IBatchValidationResponse;
    newBatch$: Observable<IBatch>;
    newBatch: IBatch;
    private unsubscribe: Subject<void> = new Subject();

    constructor(
        private batchApiService: BatchesApiService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.newBatch$ = new Observable<IBatch>(null);
        this.validation$ = new Observable<IBatchValidationResponse>(null);
    }

    ngOnInit() {
        this.validation$ = this.batchApiService.validation;
        this.newBatch$ = this.batchApiService.batch;

        if (this.batch) {
            this.batchConfig = [
                { title: 'Title', value: this.batch.title },
                { title: 'Description', value: this.batch.description },
                { title: 'Recipe Type', value: this.batch.recipe_type.title },
                { title: 'Nodes', value: this.batch.definition.forced_nodes.nodes.join(', ') },
                { title: 'Priority', value: this.batch.configuration.priority },
                { title: 'Supersedes', value: this.batch.supersedes }
            ];
        }

        if (this.batch && this.batchDataset) {
            this.newBatchPayload = {
                title: this.batch.title,
                description: this.batch.description,
                recipe_type_id: this.batch.recipe_type.id,
                supersedes: this.batch.supersedes === 'true',
                definition: {
                    forced_nodes: {
                        all: false,
                        nodes: this.batch.definition.forced_nodes.nodes
                    },
                    dataset: this.batchDataset.id
                },
                configuration: { ...this.batch.configuration }
            };
        }

        this.createSubscriptions();

        if (this.datasetFormOptions) {
            this.buildDatasetConfig();
        }
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    createSubscriptions() {
        this.validation$
            .pipe(takeUntil(this.unsubscribe), skip(1))
            .subscribe(res => {
                this.validation = res;
                if (res) {
                    res.warnings.map(warning => {
                        this.messageService.add({
                            severity: 'warn',
                            summary: warning.name,
                            detail: warning.description
                        });
                    });

                    res.errors.map(error => {
                        this.messageService.add({
                            severity: 'error',
                            summary: error.name,
                            detail: error.description
                        });
                    });

                    if (res.is_valid && !this.newBatch) {
                        this.batchApiService.createBatch(this.newBatchPayload);
                    }
                }
            });

        this.newBatch$
            .pipe(takeUntil(this.unsubscribe), skip(1))
            .subscribe(res => {
                this.newBatch = res;
                if (res) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Batch Created',
                        detail: 'Batch created.'
                    });
                    console.log('Navigate to batches list when complete.');
                    this.router.navigate(['/processing/batches/']);
                }
            });
    }

    onRunBatchClick() {
        if (!this.validation) {
            this.messageService.add({
                severity: 'success',
                summary: 'Validating Batch',
                detail: 'Validating Batch'
            });
            this.batchApiService.validateBatch(this.newBatchPayload);
        }
    }

    isNewDataset() {
        return this.datasetFormOptions && this.datasetFormOptions.datasetSelection === 'CreateNew';
    }

    getDatasetHeader(): string {
        return `Dataset Configuration${this.isNewDataset() ? ' (new)' : ' (existing)'}`;
    }

    buildDatasetConfig() {
        const form = this.datasetFormOptions;

        if (form.datasetSelection !== 'CreateNew') {
            this.datasetConfig = [
                { title: 'Title', value: form.datasetSelection.title },
                { title: 'Description', value: form.datasetSelection.description }
            ];
        }

        if (this.isNewDataset()) {
            const datePrefix = form.searchTime.charAt(0).toUpperCase() + form.searchTime.slice(1);
            this.datasetConfig = [
                { title: 'Title', value: form.title },
                { title: 'Description', value: form.description },
                { title: `${datePrefix} Start Date`, value: new Date(form.startDate).toISOString() },
                { title: `${datePrefix} End Date`, value: new Date(form.endDate).toISOString() }
            ];

            if (form.optionalFilters && form.optionalFilters.locationFilter) {
                this.datasetConfig.push({ title: 'Location', value: form.optionalFilters.locationFilter });
            }

            if (form.optionalFilters && form.optionalFilters.mediaTypesFilter) {
                this.datasetConfig.push({
                    title: 'Media Type',
                    value: form.optionalFilters.mediaTypesFilter
                });
            }

            if (
                form.optionalFilters &&
                form.optionalFilters.recipeTypesFilter
            ) {
                const recipeType = form.optionalFilters.recipeTypesFilter;
                this.datasetConfig.push({
                    title: 'Recipe Type',
                    value: `${recipeType.title}${recipeType.revision ? ' v' + recipeType.revision : ''}`
                });
            }
        }
    }
}

export interface IDisplayConfig {
    title: string;
    value: string | string[];
}
