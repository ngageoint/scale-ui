import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { BatchesApiService } from './api.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';

@Component({
    selector: 'dev-batch-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class BatchDetailsComponent implements OnInit {
    batchDetails: any = [];
    recipeType: RecipeType;

    constructor(
        private route: ActivatedRoute,
        private recipeTypesApiService: RecipeTypesApiService,
        private batchesApiService: BatchesApiService
    ) {}

    ngOnInit() {
        if (this.route.snapshot) {
            const id = +this.route.snapshot.paramMap.get('id');
            this.batchesApiService.getBatch(id).subscribe(data => {
                this.batchDetails = data;
                this.recipeTypesApiService.getRecipeType(
                    data.recipe_type.name,
                    data.recipe_type_rev.revision_num
                ).subscribe(recipeTypeData => {
                    this.recipeType = recipeTypeData;
                });
            });
        }
    }
}
