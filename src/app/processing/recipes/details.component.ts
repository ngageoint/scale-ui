import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { RecipesApiService } from './api.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';

@Component({
    selector: 'app-recipe-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class RecipeDetailsComponent implements OnInit {
    recipeType: any;
    constructor(
        private route: ActivatedRoute,
        private recipesApiService: RecipesApiService
    ) { }

    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.recipesApiService.getRecipe(id).then(data => {
                this.recipeType = RecipeType.transformer(data.recipe_type);

                const jobTypes = [];
                _.forEach(data.jobs, (jobData) => {
                    // attach revision interface to each job type
                    const jobType = jobData.job.job_type;
                    jobType.job_type_interface = jobData.job.job_type_rev.interface;
                    jobTypes.push(jobType);

                    // include current job instance in definition
                    const recipeTypeJob = _.find(this.recipeType.definition.jobs, j => {
                        return j.job_type.name === jobData.job.job_type.name && j.job_type.version === jobData.job.job_type.version;
                    });
                    if (recipeTypeJob) {
                        recipeTypeJob.instance = jobData.job;
                    }
                });
                // build recipe type details with revision definition and adjusted job types
                this.recipeType.job_types = jobTypes;
            });
        }
    }
}
