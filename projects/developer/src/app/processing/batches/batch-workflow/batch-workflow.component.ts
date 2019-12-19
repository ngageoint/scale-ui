import { MenuItem, MessageService } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { RecipeType } from '../../../configuration/recipe-types/api.model';
import { Dataset } from '../../../data/models/dataset.model';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
    providers: [MessageService],
    selector: 'dev-batch-workflow',
    templateUrl: './batch-workflow.component.html',
    styleUrls: ['./batch-workflow.component.scss']
})
export class BatchWorkflowComponent implements OnInit {
    items: MenuItem[];
    activeIndex = 0;
    activeStepName = 'create-batch';
    recipeSelection: RecipeType;
    datasetSelection: Dataset;

    private stepNameDictionary = {
        0: 'create-batch',
        1: 'create-dataset',
        2: 'run-batch'
    };

    constructor(
        private messageService: MessageService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.items = [
            {label: 'Create Batch'},
            {label: 'Create Dataset'},
            {
                label: 'Run Batch',
                command: (event: any) => {
                    console.log('Validate the batch created with the dataset.');
                }
            }
        ];

    }

    isOptionalStep() {
        switch (this.activeIndex) {
            case 0:
            // Select recipe type
            case 1:
            // Create dataset
            case 2:
            // Create dataset
            default:
                return false;
        }
    }

    handleRecipeSelection(event) {
        this.recipeSelection = event;
    }

    handleDatasetSelection(event) {
        this.datasetSelection = event;
    }

    handleStepChange(event) {
        this.activeIndex = event;
        this.activeStepName = this.stepNameDictionary[event];
    }
}
