import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { RecipesApiService } from './api.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';

@Component({
    selector: 'app-recipe-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class RecipeDetailsComponent implements OnInit, OnDestroy {
    recipeType: any;
    subscription: any;

    constructor(
        private messageService: MessageService,
        private route: ActivatedRoute,
        private recipesApiService: RecipesApiService,
        private recipeTypesApiService: RecipeTypesApiService
    ) { }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.subscription = this.recipesApiService.getRecipe(id, true).subscribe(data => {
                this.recipeTypesApiService.getRecipeType(data.recipe_type.id).subscribe(recipeTypeData => {
                    this.recipeType = RecipeType.transformer(recipeTypeData);
                    const jobTypes = [];
                    _.forEach(data.jobs, (jobData) => {
                        // attach revision interface to each job type
                        jobTypes.push(jobData.job.job_type);

                        // include current job instance in definition
                        const recipeTypeJob = _.find(this.recipeType.definition.jobs, j => {
                            return j.job_type.name === jobData.job.job_type.manifest.job.name &&
                                j.job_type.version === jobData.job.job_type.manifest.job.jobVersion;
                        });
                        if (recipeTypeJob) {
                            recipeTypeJob.instance = jobData.job;
                        }
                    });
                    // build recipe type details with revision definition and adjusted job types
                    this.recipeType.job_types = jobTypes;
                }, err => {
                    this.messageService.add({severity: 'error', summary: 'Error retrieving recipe type', detail: err.statusText});
                });
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error retrieving recipe', detail: err.statusText});
            });
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
