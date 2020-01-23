import { BatchesApiService } from './../../api.service';
import { Batch } from './../../api.model';
import { Dataset } from './../../../../data/models/dataset.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'dev-run-batch',
    templateUrl: './run-batch.component.html',
    styleUrls: ['./run-batch.component.scss']
})
export class RunBatchComponent implements OnInit {
    @Input() stepIndex: number;
    @Input() batch: Batch;
    @Input() batchDataset: Dataset;
    @Input() datasetFormOptions: any;
    newBatchPayload: any;
    batchConfig: IDisplayConfig[] = [];
    datasetConfig: IDisplayConfig[] = [];

    constructor(private batchApiService: BatchesApiService) {}



    ngOnInit() {
        if (this.batch) {
            this.batchConfig = [
                {title: 'Title', value: this.batch.title},
                {title: 'Description', value: this.batch.description},
                {title: 'Recipe Type', value: this.batch.recipe_type.title},
                {title: 'Nodes', value: this.batch.definition.previous_batch.forced_nodes.nodes.join(', ')},
                {title: 'Priority', value: this.batch.configuration.priority},
                {title: 'Supersedes', value: this.batch.supersedes}
            ];
        }

        if (this.datasetFormOptions) {
            this.buildDatasetConfig();
        }

        console.log('Dataset Form Options: ', this.datasetFormOptions);
    }

    onRunBatchClick() {
        this.newBatchPayload = {
            ...this.batch,
            definition: {
                ...this.batch.definition,
                dataset: this.batchDataset.id
            }
        };
        console.log('Payload: ', this.newBatchPayload);
        // this.batchApiService.createBatch(this.newBatchPayload);
    }

    isNewDataset(): boolean {
        return this.datasetFormOptions && this.datasetFormOptions.datasetSelection === 'CreateNew';
    }

    getDatasetHeader(): string {
        return `Dataset Configuration${this.isNewDataset() ? ' (new)' : ' (existing)' }`;
    }

    buildDatasetConfig() {
        this.datasetConfig = [];

        const form = this.datasetFormOptions;

        if (form.datasetSelection) {
            this.datasetConfig.push(
                {title: 'Title', value: form.datasetSelection.title},
                {title: 'Description', value: form.datasetSelection.description}
            );
        }

        if (this.isNewDataset()) {
            this.datasetConfig.push(
                {title: 'Title', value: form.title},
                {title: 'Description', value: form.description},
                {title: 'Start Date', value: new Date(form.startDate).toISOString()},
                {title: 'End Date', value: new Date(form.endDate).toISOString()}
            );

            if (form.optionalFilters && form.optionalFilters.locationFilter) {
                this.datasetConfig.push({title: 'Location', value: form.optionalFilters.locationFilter});
            }

            if (form.optionalFilters && form.optionalFilters.mediaTypesFilter) {
                this.datasetConfig.push({title: 'Media Type', value: form.optionalFilters.mediaTypesFilter});
            }

            if (form.optionalFilters && form.optionalFilters.recipeTypesFilter) {
                const recipeType = form.optionalFilters.recipeTypesFilter;

                this.datasetConfig.push({title: 'Recipe Type', value: `${recipeType.title} v${recipeType.revision}`});
            }
        }
    }
}

export interface IDisplayConfig {
    title: string;
    value: string | string[];
}
