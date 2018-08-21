import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Batch } from './api.model';
import { BatchesApiService } from './api.service';
import { DataService } from '../../common/services/data.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';

@Component({
    selector: 'dev-batches-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class BatchesCreateComponent implements OnInit {
    batch = new Batch();
    recipeTypeOptions: SelectItem[] = [];

    constructor(
        private batchesApiService: BatchesApiService,
        private dataService: DataService,
        private recipeTypesApiService: RecipeTypesApiService
    ) {
        this.batch.title = 'Untitled Batch';
    }

    private getRecipeTypes() {
        return this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            const recipeTypes = RecipeType.transformer(data.results);
            _.forEach(recipeTypes, rt => {
                this.recipeTypeOptions.push({
                    label: rt.title,
                    value: rt
                });
            });
        }, err => {
            console.log('Error retrieving recipe types: ' + err);
        });
    }

    ngOnInit() {
        this.getRecipeTypes();
    }
}
