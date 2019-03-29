import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { RecipesApiService } from './api.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';

@Component({
    selector: 'dev-recipe-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class RecipeDetailsComponent implements OnInit, OnDestroy {
    recipeType: any;
    recipe: any;
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
            const id = +this.route.snapshot.paramMap.get('id');
            this.subscription = this.recipesApiService.getRecipe(id, true).subscribe(recipe => {
                this.recipe = recipe;
                // get full recipe type to retrieve job types with manifests
                this.recipeTypesApiService.getRecipeType(recipe.recipe_type.name).subscribe(recipeType => {
                    // add recipe detail data to nodes
                    _.forEach(recipe.recipe_type_rev.definition.nodes, node => {
                        const recipeDetail = _.find(this.recipe.details.nodes, rd => {
                            return node.node_type.job_type_name === rd.node_type.job_type_name &&
                                node.node_type.job_type_version === rd.node_type.job_type_version;
                        });
                        if (recipeDetail) {
                            _.merge(node.node_type, recipeDetail.node_type);
                        }
                    });
                    // create recipe type, using mostly data from recipe_type_rev
                    this.recipeType = RecipeType.transformer(
                        {
                            id: recipe.recipe_type_rev.recipe_type.id,
                            name: recipe.recipe_type_rev.recipe_type.name,
                            title: recipe.recipe_type_rev.recipe_type.title,
                            description: recipe.recipe_type_rev.recipe_type.description,
                            is_active: recipe.recipe_type_rev.recipe_type.is_active,
                            revision_num: recipe.recipe_type_rev.revision_num,
                            definition: recipe.recipe_type_rev.definition,
                            job_types: recipeType.job_types,
                            sub_recipe_types: recipe.sub_recipe_types,
                            created: recipe.recipe_type_rev.recipe_type.created,
                            deprecated: recipe.recipe_type_rev.recipe_type.deprecated,
                            last_modified: recipe.recipe_type_rev.recipe_type.last_modified
                        }
                    );
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
