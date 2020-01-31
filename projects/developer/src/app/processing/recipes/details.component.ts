import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { Subscription } from 'rxjs';
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
    forcedNodes: any;
    allNodes = false;
    nodeOptions: SelectItem[] = [];
    selectedNodes = [];
    recipe: any;
    subscriptions: Subscription[] = [];
    showReprocess = false;
    loading = false;

    constructor(
        private messageService: MessageService,
        private route: ActivatedRoute,
        private recipesApiService: RecipesApiService,
        private recipeTypesApiService: RecipeTypesApiService
    ) {}

    reprocess() {
        this.loading = true;
        this.recipeTypesApiService.validateRecipeType({
            name: this.recipeType.name,
            definition: RecipeType.cleanDefinition(this.recipeType.definition)
        }).subscribe(result => {
            this.loading = false;
            this.showReprocess = true;
            if (result.diff.can_be_reprocessed) {
                this.nodeOptions = [];
                this.selectedNodes = [];
                this.forcedNodes = {
                    all: false,
                    nodes: [],
                    sub_recipes: {}
                };
                _.forEach(_.keys(this.recipeType.definition.nodes), node => {
                    const nodeObj = this.recipeType.definition.nodes[node];
                    const nodeType = this.recipeType.definition.nodes[node].node_type.node_type;
                    let label = null;
                    if (nodeType === 'job') {
                        const jobType: any = _.find(this.recipe.job_types, {
                            name: nodeObj.node_type.job_type_name,
                            version: nodeObj.node_type.job_type_version
                        });
                        label = `${jobType.title} v${jobType.version}`;
                    } else if (nodeType === 'recipe') {
                        const recipeType: any = _.find(this.recipe.sub_recipe_types, {
                            name: nodeObj.node_type.recipe_type_name
                        });
                        label = recipeType.title;
                    }
                    if (nodeType !== 'condition') {
                        this.nodeOptions.push({
                            label: label,
                            value: node
                        });
                    }
                });
            } else {
                this.messageService.add({ severity: 'error', summary: 'Recipe cannot be reprocessed' });
            }
        }, err => {
            console.log(err);
            this.messageService.add({ severity: 'error', summary: 'Error validating recipe type', detail: err.statusText });
        });
    }

    handleReprocess() {
        this.showReprocess = false;
        const subRecipes = {};
        // all aspects of all sub recipes will be reprocessed
        _.forEach(this.recipeType.sub_recipe_types, recipeType => {
            subRecipes[recipeType.name] = {
                all: true
            };
        });
        const forcedNodes = {
            all: this.allNodes,
            nodes: this.selectedNodes,
            sub_recipes: subRecipes
        };
        this.loading = true;
        this.recipesApiService.reprocessRecipe(this.recipe.id, forcedNodes).subscribe(() => {
            this.messageService.add({severity: 'success', summary: 'Reprocess request successful'});
            this.loading = false;
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error reprocessing recipe', detail: err.statusText});
            this.loading = false;
        });
    }

    setAllNodes(event) {
        this.allNodes = event;
    }

    /**
     * Load recipe details from the server.
     * @param id the id from the route param of the recipe to load
     */
    loadRecipeDetails(id: number): void {
        this.loading = true;

        this.subscriptions.push(
            this.recipesApiService.getRecipe(id, true).subscribe(recipe => {
                this.recipe = recipe;
                // get full recipe type to retrieve job types with manifests
                this.recipeTypesApiService.getRecipeType(recipe.recipe_type.name).subscribe(recipeType => {
                    // add recipe detail data to nodes
                    _.forEach(recipe.recipe_type_rev.definition.nodes, node => {
                        // try to merge in the job details first
                        const recipeDetail = _.find(this.recipe.details.nodes, rd => {
                            return node.node_type.recipe_type_name === rd.node_type.recipe_type_name
                                && node.node_type.recipe_type_revision === rd.node_type.recipe_type_revision;
                        });
                        if (recipeDetail && node.node_type.job_type_name === recipeDetail.node_type.job_type_name) {
                            // ensure only the job matches
                           _.merge(node.node_type, recipeDetail.node_type);
                        }

                        // try to merge in the job details
                        const jobDetail = _.find(this.recipe.details.nodes, rd => {
                            return node.node_type.job_type_name === rd.node_type.job_type_name
                                && node.node_type.job_type_revision === rd.node_type.job_type_revision;
                        });
                        if (jobDetail) {
                            _.merge(node.node_type, jobDetail.node_type);
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
                    this.loading = false;
                }, err => {
                    this.messageService.add({severity: 'error', summary: 'Error retrieving recipe type', detail: err.statusText});
                    this.loading = false;
                });
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error retrieving recipe', detail: err.statusText});
                this.loading = false;
            })
        );
    }

    ngOnInit() {
        // watch for route changes and reload the recipe
        if (this.route && this.route.params) {
            this.route.params.subscribe(params => {
                this.loadRecipeDetails(params.id);
            });
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
}
