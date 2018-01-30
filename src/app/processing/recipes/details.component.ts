import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import * as _ from 'lodash';

import { Recipe } from './api.model';
import { RecipesApiService } from './api.service';
// import { RecipeType } from '../../configuration/recipe-types/api.model';

@Component({
    selector: 'app-recipe-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class RecipeDetailsComponent implements OnInit {
    recipe: any;
    recipeType: any;
    constructor(
        private route: ActivatedRoute,
        private recipesApiService: RecipesApiService
    ) { }

    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.recipesApiService.getRecipe(id).then(data => {
                this.recipe = Recipe.transformer(data);

                // // attach revision interface to each job type
                // const jobTypes = [];
                // _.forEach(data.jobs, (jobData) => {
                //     const jobType = jobData.job.job_type;
                //     jobType.job_type_interface = jobData.job.job_type_rev.interface;
                //     jobTypes.push(jobType);
                // });
                // // build recipe type details with revision definition and adjusted job types
                // this.recipeType = new RecipeType(
                //     this.recipe.recipe_type.id,
                //     this.recipe.recipe_type.name,
                //     this.recipe.recipe_type.version,
                //     this.recipe.recipe_type.title,
                //     this.recipe.recipe_type.description,
                //     this.recipe.recipe_type.is_active,
                //     this.recipe.recipe_type_rev.definition,
                //     this.recipe.recipe_type.revision_num,
                //     this.recipe.recipe_type.created,
                //     this.recipe.recipe_type.last_modified,
                //     this.recipe.recipe_type.archived,
                //     this.recipe.recipe_type.trigger_rule,
                //     jobTypes
                // );
            });
        }
    }
}
