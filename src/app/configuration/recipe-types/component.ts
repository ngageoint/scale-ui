import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MenuItem, SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { RecipeTypesApiService } from './api.service';
import { JobTypesApiService } from '../job-types/api.service';
import { DataService } from '../../data.service';
import { RecipeType } from './api.model';
import { JobType } from '../job-types/api.model';
import { RecipeTypeDefinition } from './definition.model';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipeTypesComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    loadingRecipeType: boolean;
    recipeTypeId: number;
    jobTypes: any;
    recipeTypes: SelectItem[];
    selectedRecipeType: SelectItem;
    selectedRecipeTypeDetail: any;
    selectedJobType: JobType;
    addJobTypeDisplay: boolean;
    scrollHeight: any;
    isEditing: boolean;

    constructor(
        private recipeTypesApiService: RecipeTypesApiService,
        private jobTypesApiService: JobTypesApiService,
        private dataService: DataService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        if (this.router.events) {
            this.routerEvents = this.router.events
                .filter((event) => event instanceof NavigationEnd)
                .map(() => this.route)
                .subscribe(() => {
                    this.recipeTypes = [];
                    if (this.route && this.route.paramMap) {
                        this.routeParams = this.route.paramMap.subscribe(params => {
                            this.recipeTypeId = params.get('id') ? +params.get('id') : null;
                        });
                    }
                    this.recipeTypesApiService.getRecipeTypes().then(data => {
                        _.forEach(data.results, (result) => {
                            this.recipeTypes.push({
                                label: result.title + ' ' + result.version,
                                value: result
                            });
                            if (this.recipeTypeId === result.id) {
                                this.selectedRecipeType = _.clone(result);
                            }
                        });
                        if (this.recipeTypeId) {
                            this.isEditing = false;
                            this.getRecipeTypeDetail(this.recipeTypeId);
                        } else {
                            if (this.recipeTypeId === 0) {
                                this.selectedRecipeType = {
                                    label: 'New Recipe',
                                    value: new RecipeType(
                                        null,
                                        'new-recipe',
                                        'New Recipe',
                                        '1.0',
                                        'Description of a new recipe',
                                        true,
                                        new RecipeTypeDefinition([], '1.0', []),
                                        null,
                                        null,
                                        null,
                                        null,
                                        null,
                                        null
                                    )
                                };
                                this.selectedRecipeTypeDetail = this.selectedRecipeType.value;
                                this.isEditing = true;
                            }
                        }
                    });
                });
        }
    }

    private getRecipeTypeDetail(id: number) {
        this.loadingRecipeType = true;
        this.recipeTypesApiService.getRecipeType(id).then(data => {
            this.loadingRecipeType = false;
            this.selectedRecipeTypeDetail = data;
        }).catch(e => {
            console.log(e);
            this.loadingRecipeType = false;
        });
    }

    createNewRecipe() {
        this.router.navigate(['/configuration/recipe-types/0']);
    }

    showAddJobType() {
        this.addJobTypeDisplay = true;
    }

    addJobType(jobType) {
        // get job type detail in order to obtain the interface
        this.jobTypesApiService.getJobType(jobType.id).then(data => {
            const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
            if (!recipeData.job_types) {
                recipeData.job_types = [];
            }
            recipeData.definition.jobs.push({
                dependencies: [],
                job_type: {
                    name: data.name,
                    version: data.version
                },
                name: data.name,
                recipe_inputs: []
            });
            recipeData.job_types.push(data);
            this.selectedRecipeTypeDetail = recipeData;
            this.addJobTypeDisplay = false;
        }).catch(err => {
            // todo show growl message with error info
            console.log(err);
        });
    }

    toggleEdit() {
        // todo add warning that changes will be discarded
        this.isEditing = !this.isEditing;
        if (this.recipeTypeId === 0) {
            this.router.navigate(['/configuration/recipe-types']);
        } else {
            if (!this.isEditing) {
                // reset recipe type
                this.getRecipeTypeDetail(this.recipeTypeId);
            }
        }
    }

    validateRecipeType() {
        console.log('validate');
    }

    saveRecipeType() {
        console.log('save');
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onRowSelect(e) {
        this.router.navigate([`/configuration/recipe-types/${e.value.id}`]);
    }
    ngOnInit() {
        this.scrollHeight = this.dataService.getViewportSize().height * 0.85;
        this.jobTypesApiService.getJobTypes().then(data => {
            this.jobTypes = data.results;
        });
    }
    ngOnDestroy() {
        this.routerEvents.unsubscribe();
        this.routeParams.unsubscribe();
    }
}
