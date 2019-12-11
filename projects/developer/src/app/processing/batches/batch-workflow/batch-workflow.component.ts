import { FormBuilder, FormGroup } from '@angular/forms';
import {MenuItem, MessageService} from 'primeng/api';
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
    activeStepName = 'select-recipe-type';
    recipeSelection: RecipeType;
    datasetSelection: Dataset;

    constructor(
        private messageService: MessageService,
        private router: Router,
        private activatedRoute: ActivatedRoute
        ) { }

    ngOnInit() {
        this.items = [
            {
                label: 'Select Recipe Type',
                command: (event: any) => {
                    this.activeIndex = 0;
                    this.activeStepName = 'select-recipe-type';
                }
            },
            {
                label: 'Create Dataset',
                command: (event: any) => {
                    this.activeIndex = 1;
                    this.activeStepName = 'create-dataset';
                }
            },
            {
                label: 'Create Batch',
                command: (event: any) => {
                    this.activeIndex = 2;
                    this.activeStepName = 'create-batch';
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
                return true;
            default:
                return false;
        }
    }

    getStepHeader() {
        return `${this.items[this.activeIndex].label} ${this.isOptionalStep() ? '(Optional)' : ''}`;
    }

    handleRecipeSelection(event) {
        this.recipeSelection = event;
    }

    handleDatasetSelection(event) {
        this.datasetSelection = event;
    }
}
