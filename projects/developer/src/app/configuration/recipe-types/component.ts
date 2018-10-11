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
    recipeTypeName: string;
    recipeTypeRevisionNum: number;
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
                        this.recipeTypeName = params.get('name');
                        this.recipeTypeRevisionNum = params.get('revision_num') ? +params.get('revision_num') : null;
                    });
                }
                this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
                    _.forEach(data.results, (result) => {
                        this.recipeTypes.push({
                            label: result.title,
                            value: result
                        });
                        if (this.recipeTypeName === result.name && this.recipeTypeRevisionNum === result.revision_num) {
                            this.selectedRecipeType = _.clone(result);
                        }
                    });
                    if (this.recipeTypeName && this.recipeTypeRevisionNum) {
                        this.isEditing = false;
                        this.getRecipeTypeDetail(this.recipeTypeName, this.recipeTypeRevisionNum);
                    } else {
                        if (this.recipeTypeName === 'new' && !this.recipeTypeRevisionNum) {
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

    private getRecipeTypeDetail(name: string, revision_num: number) {
        this.loadingRecipeType = true;
        this.recipeTypesApiService.getRecipeType(name, revision_num).subscribe(data => {
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
        this.jobTypesApiService.getJobType(jobType.name, jobType.version).subscribe(data => {
            const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
            if (!recipeData.job_types) {
                recipeData.job_types = [];
            }
            const input = {};
            _.forEach(data.manifest.job.interface.inputs.files, file => {
                input[file.name] = {};
            });
            recipeData.definition.nodes[data.manifest.job.name] = {
                dependencies: [],
                input: input,
                node_type: {
                    node_type: 'job',
                    job_type_name: data.manifest.job.name,
                    job_type_version: data.manifest.job.jobVersion,
                    job_type_revision: data.revision_num
                }
            };
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
        delete recipeData.definition.nodes[jobType.name];
        this.selectedRecipeTypeDetail = recipeData;
    }

    toggleEdit() {
        // todo add warning that changes will be discarded
        this.isEditing = !this.isEditing;
        if (!this.recipeTypeName || !this.recipeTypeRevisionNum) {
            this.router.navigate(['/configuration/recipe-types']);
        } else {
            if (!this.isEditing) {
                // reset recipe type
                this.getRecipeTypeDetail(this.recipeTypeName, this.recipeTypeRevisionNum);
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
            window.open(`/configuration/recipe-types/${e.value.name}/${e.value.revision_num}`);
        } else {
            this.router.navigate([`/configuration/recipe-types/${e.value.name}/${e.value.revision_num}`]);
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
