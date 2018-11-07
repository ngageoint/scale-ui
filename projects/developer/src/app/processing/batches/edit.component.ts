import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { MessageService } from 'primeng/api';
import { Batch } from './api.model';
import { BatchesApiService } from './api.service';
import { DataService } from '../../common/services/data.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';

@Component({
    selector: 'dev-batches-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class BatchesEditComponent implements OnInit {
    batch = new Batch();
    recipeTypeOptions: SelectItem[] = [];
    previousBatchOptions: SelectItem[] = [];
    jobOptions: SelectItem[] = [];
    isValidated = false;

    constructor(
        private messageService: MessageService,
        private batchesApiService: BatchesApiService,
        private dataService: DataService,
        private recipeTypesApiService: RecipeTypesApiService
    ) {
        this.batch.title = 'Untitled Batch';
    }

    private getRecipeTypes() {
        return this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            const recipeTypes = RecipeType.transformer(data.results);
            _.forEach(recipeTypes, (rt: any) => {
                this.recipeTypeOptions.push({
                    label: rt.title,
                    value: rt
                });
            });
        }, err => {
            console.log('Error retrieving recipe types: ' + err);
        });
    }

    handleRecipeTypeChange(event) {
        this.batchesApiService.getBatches({recipe_type_name: event.value.name}).subscribe(data => {
            const batches = Batch.transformer(data.results);
            _.forEach(batches, (b: any) => {
                this.previousBatchOptions.push({
                    label: b.title,
                    value: b.root_batch.id
                });
            });
        });
        _.forEach(this.batch.recipe_type.definition.jobs, job => {
            this.jobOptions.push({
                label: job.name,
                value: job.name
            });
        });
    }

    setAllJobs(event) {
        this.batch.definition.all_jobs = event;
    }

    validateBatch() {
        const batchToValidate = {
            recipe_type_id: this.batch.recipe_type.id,
            definition: this.batch.definition,
            configuration: this.batch.configuration
        };
        this.batchesApiService.validateBatch(batchToValidate).subscribe(data => {
            this.isValidated = data.is_valid;
            if (data.errors.length > 0) {
                const errors = [];
                _.forEach(data.errors, error => {
                    errors.push({severity: 'error', summary: error.name, detail: error.description, sticky: true});
                });
                this.messageService.addAll(errors);
            }
            if (data.warnings.length > 0) {
                const warnings = [];
                _.forEach(data.warnings, error => {
                    warnings.push({severity: 'warn', summary: error.name, detail: error.description, sticky: true});
                });
                this.messageService.addAll(warnings);
            }
        });
    }

    ngOnInit() {
        this.getRecipeTypes();
    }
}
