import { Batch } from './../api.model';
import { MenuItem } from 'primeng/api';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { RecipeType } from '../../../configuration/recipe-types/api.model';
import { Dataset } from '../../../data/models/dataset.model';

@Component({
    selector: 'dev-batch-workflow',
    templateUrl: './batch-workflow.component.html',
    styleUrls: ['./batch-workflow.component.scss']
})
export class BatchWorkflowComponent implements OnInit {
    steps: MenuItem[];
    private stepNameDictionary = {
        0: 'create-batch',
        1: 'create-dataset',
        2: 'run-batch'
    };
    @Input() currentStep = 0;
    get currentStepName(): string {
        return this.stepNameDictionary[this.currentStep];
    }
    @Output() activeIndexChange: EventEmitter<any> = new EventEmitter();
    recipeSelection: RecipeType;
    datasetSelection: Dataset;
    datasetFormOptions: any;
    batchSelection: Batch;
    batchRecipe: RecipeType;
    multipleInput: boolean;

    constructor() {}

    ngOnInit() {
        this.steps = [
            {label: 'Create Batch'},
            {label: 'Create Dataset'},
            {label: 'Run Batch'}
        ];
    }

    handleRecipeSelection(event) {
        this.recipeSelection = event;
    }

    handleDatasetSelection(event) {
        if (event.dataset.datasetSelection) {
            this.datasetSelection = event.dataset.datasetSelection;
        } else {
            this.datasetSelection = event.datasetSelection;
        }
    }

    handleStepChange(event) {
        this.currentStep = event;
    }

    private next(event: {index: number, createBatch?: any, dataset?: any}): void {
        this.currentStep = this.currentStep + 1;
        if (event.createBatch) {
            this.batchSelection = event.createBatch.batch;
            this.batchRecipe = event.createBatch.batchRecipe;
            this.multipleInput = event.createBatch.multipleInput;
        }
        if (event.dataset) {
            this.datasetSelection = event.dataset.datasetSelection;
            this.datasetFormOptions =  event.dataset.datasetFormOptions;
        }

        this.activeIndexChange.emit(this.currentStep);
    }
}
