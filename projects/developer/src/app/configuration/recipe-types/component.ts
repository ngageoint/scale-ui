import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { map, filter } from 'rxjs/operators';

import { RecipeTypesApiService } from './api.service';
import { JobTypesApiService } from '../job-types/api.service';
import { DataService } from '../../common/services/data.service';
import { RecipeType } from './api.model';
import { RecipeTypeDefinition } from './definition.model';

@Component({
    selector: 'dev-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipeTypesComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    columns: any[];
    loadingRecipeType: boolean;
    recipeTypeId: number;
    jobTypes: any;
    selectedJobTypes = [];
    recipeTypes: SelectItem[];
    selectedRecipeType: SelectItem;
    selectedRecipeTypeDetail: any;
    toggleJobTypeDisplay: boolean;
    isEditing: boolean;

    constructor(
        private recipeTypesApiService: RecipeTypesApiService,
        private jobTypesApiService: JobTypesApiService,
        private dataService: DataService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.columns = [
            { field: 'title', header: 'Title', filterMatchMode: 'contains' }
        ];
        if (this.router.events) {
            this.routerEvents = this.router.events.pipe(
                filter((event) => event instanceof NavigationEnd),
                map(() => this.route)
            ).subscribe(() => {
                this.recipeTypes = [];
                if (this.route && this.route.paramMap) {
                    this.routeParams = this.route.paramMap.subscribe(params => {
                        this.recipeTypeId = params.get('id') ? +params.get('id') : null;
                    });
                }
                this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
                    _.forEach(data.results, (result) => {
                        this.recipeTypes.push({
                            label: result.title,
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
                                    'Description of a new recipe',
                                    true,
                                    new RecipeTypeDefinition({}, {}),
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
        this.recipeTypesApiService.getRecipeType(id).subscribe(data => {
            this.loadingRecipeType = false;
            this.selectedRecipeTypeDetail = data;
            const jtArray = [];
            const jobNames = _.map(_.values(this.selectedRecipeTypeDetail.definition.nodes), 'node_type.job_type_name');
            _.forEach(this.jobTypes, jt => {
                if (_.includes(jobNames, jt.name)) {
                    jtArray.push(jt);
                }
            });
            this.selectedJobTypes = jtArray;
        }, err => {
            console.log(err);
            this.loadingRecipeType = false;
        });
    }

    createNewRecipe() {
        this.router.navigate(['/configuration/recipe-types/0']);
    }

    showToggleJobType() {
        this.toggleJobTypeDisplay = true;
    }

    addJobType(event) {
        const jobType = event.data;
        // get job type detail in order to obtain the interface
        this.jobTypesApiService.getJobType(jobType.manifest.job.name, jobType.manifest.job.jobVersion).subscribe(data => {
            const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
            if (!recipeData.job_types) {
                recipeData.job_types = [];
            }
            recipeData.definition.jobs.push({
                dependencies: [],
                job_type: {
                    name: data.manifest.job.name,
                    version: data.manifest.job.jobVersion
                },
                name: data.manifest.job.name,
                recipe_inputs: []
            });
            recipeData.job_types.push(data);
            this.selectedRecipeTypeDetail = recipeData;
        }, err => {
            // todo show growl message with error info
            console.log(err);
        });
    }

    removeJobType(event) {
        const jobType = event.data;
        const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
        _.remove(recipeData.definition.jobs, job => {
            return job.job_type.name === jobType.manifest.job.name && job.job_type.version === jobType.manifest.job.jobVersion;
        });
        this.selectedRecipeTypeDetail = recipeData;
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
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/configuration/recipe-types/${e.value.id}`);
        } else {
            this.router.navigate([`/configuration/recipe-types/${e.value.id}`]);
        }
    }

    ngOnInit() {
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = data.results;
        });
    }

    ngOnDestroy() {
        this.routerEvents.unsubscribe();
        this.routeParams.unsubscribe();
    }
}
