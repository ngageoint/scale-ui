import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

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
    private routeParams: any;
    private viewMenu: MenuItem[] = [
        { label: 'Edit', icon: 'fa fa-edit', command: () => { this.toggleEdit(); } }
    ];
    private editMenu: MenuItem[] = [
        { label: 'Validate', icon: 'fa fa-check', command: () => { this.validateRecipeType(); } },
        { label: 'Save', icon: 'fa fa-save', command: () => { this.saveRecipeType(); } },
        { separator: true },
        { label: 'Cancel', icon: 'fa fa-remove', command: () => { this.toggleEdit(); } }
    ];
    createForm: any;
    createFormSubscription: any;
    jobTypeColumns: any[];
    recipeTypeColumns: any[];
    loadingRecipeType: boolean;
    recipeTypeName: string;
    jobTypes: any;
    selectedJobTypes = [];
    recipeTypes: any; // used for adding/removing recipe nodes from recipe
    selectedRecipeTypes = []; // used for adding/removing recipe nodes from recipe
    recipeTypeOptions: SelectItem[]; // used for dropdown navigation between recipe types
    selectedRecipeTypeOption: SelectItem; // used for dropdown navigation between recipe types
    selectedRecipeTypeDetail: any;
    toggleJobTypeDisplay: boolean;
    toggleRecipeTypeDisplay: boolean;
    isEditing: boolean;
    items: MenuItem[] = _.clone(this.viewMenu);
    menuBarItems: MenuItem[] = [
        {
            label: 'Job Type',
            icon: 'fa fa-cube',
            command: () => {
                this.showToggleJobType();
            }
        },
        {
            label: 'Recipe',
            icon: 'fa fa-cubes',
            command: () => {
                this.showToggleRecipeType();
            }
        },
        {
            label: 'Condition',
            icon: 'fa fa-adjust'
        }
    ];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private jobTypesApiService: JobTypesApiService,
        private dataService: DataService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.jobTypeColumns = [
            { field: 'title', header: 'Title', filterMatchMode: 'contains' }
        ];
        this.recipeTypeColumns = [
            { field: 'title', header: 'Title', filterMatchMode: 'contains' }
        ];
    }

    private initFormGroup() {
        this.createForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required]
        });
    }

    private initValidation() {
        // enable/disable validate and save actions based on form status
        const validateItem = _.find(this.items, { label: 'Validate' });
        if (validateItem) {
            validateItem.disabled = this.createForm.status === 'INVALID';
        }
        const saveItem = _.find(this.items, { label: 'Save' });
        if (saveItem) {
            saveItem.disabled = this.createForm.status === 'INVALID';
        }
    }

    private initRecipeTypeForm() {
        if (this.selectedRecipeTypeDetail) {
            // add the values from the object
            this.createForm.patchValue(this.selectedRecipeTypeDetail);

            // modify form actions based on status
            this.initValidation();
        }

        // listen for changes to createForm fields
        this.createFormSubscription = this.createForm.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.selectedRecipeTypeDetail, changes);
            this.initValidation();
        });
    }

    private getRecipeTypeDetail(name: string) {
        this.loadingRecipeType = true;
        this.recipeTypesApiService.getRecipeType(name).subscribe(data => {
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

    private getRecipeTypes() {
        this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            this.recipeTypes = data.results;
            _.forEach(data.results, result => {
                this.recipeTypeOptions.push({
                    label: result.title,
                    value: result
                });
                if (this.recipeTypeName === result.name) {
                    this.selectedRecipeTypeOption = _.clone(result);
                }
            });
            if (this.recipeTypeName && this.recipeTypeName !== 'create') {
                this.isEditing = false;
                this.getRecipeTypeDetail(this.recipeTypeName);
            } else {
                if (this.recipeTypeName === 'create') {
                    this.selectedRecipeTypeOption = null;
                    this.selectedRecipeTypeDetail = new RecipeType(
                        null,
                        null,
                        'Untitled Recipe',
                        null,
                        true,
                        false,
                        null,
                        new RecipeTypeDefinition({}, {}),
                        null,
                        null,
                        null,
                        null,
                        null
                    );
                    this.initRecipeTypeForm();
                }
            }
        });
    }

    private unsubscribeFromForm() {
        if (this.createFormSubscription) {
            this.createFormSubscription.unsubscribe();
        }
    }

    createNewRecipe() {
        this.selectedJobTypes = [];
        this.router.navigate(['/configuration/recipe-types/create']);
    }

    showToggleJobType() {
        this.toggleJobTypeDisplay = true;
    }

    showToggleRecipeType() {
        this.toggleRecipeTypeDisplay = true;
    }

    addJobTypeNode(event) {
        const jobType = event.data;
        // get job type detail in order to obtain the interface
        this.jobTypesApiService.getJobType(jobType.name, jobType.latest_version).subscribe(data => {
            const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
            if (!recipeData.job_types) {
                recipeData.job_types = [];
            }
            const input = {};
            _.forEach(data.manifest.job.interface.inputs, inputType => {
                _.forEach(inputType, it => {
                    input[it.name] = {};
                });
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
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type details', detail: err.statusText, life: 10000});
            // remove job type from selection
            this.selectedJobTypes = _.filter(this.selectedJobTypes, jt => {
                return jt.name !== event.data.name && jt.latest_version !== event.data.latest_version;
            });
        });
    }

    addRecipeTypeNode(event) {
        // get recipe type detail in order to obtain the input
        this.recipeTypesApiService.getRecipeType(event.data.name).subscribe(data => {
            const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
            if (!recipeData.sub_recipe_types) {
                recipeData.sub_recipe_types = [];
            }
            const input = {};
            _.forEach(data.definition.input, inputType => {
                _.forEach(inputType, it => {
                    input[it.name] = {};
                });
            });
            recipeData.definition.nodes[event.data.name] = {
                dependencies: [],
                input: input,
                node_type: {
                    node_type: 'recipe',
                    recipe_type_name: event.data.name,
                    recipe_type_revision: event.data.revision_num
                }
            };
            recipeData.sub_recipe_types.push(data);
            this.selectedRecipeTypeDetail = recipeData;
        }, err => {
            console.log(err);
            this.messageService.add({
                severity: 'error',
                summary: 'Error retrieving recipe type details',
                detail: err.statusText,
                life: 10000
            });
            // remove job type from selection
            this.selectedRecipeTypes = _.filter(this.selectedRecipeTypes, rt => {
                return rt.name !== event.data.name && rt.revision_num !== event.data.revision_num;
            });
        });
    }

    removeNode(event) {
        const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
        delete recipeData.definition.nodes[event.data.name];
        this.selectedRecipeTypeDetail = recipeData;
    }

    toggleEdit() {
        // todo add warning that changes will be discarded
        this.isEditing = !this.isEditing;
        this.items = this.isEditing ? _.clone(this.editMenu) : _.clone(this.viewMenu);
        if (!this.recipeTypeName || this.recipeTypeName === 'create') {
            this.router.navigate(['/configuration/recipe-types']);
        } else {
            if (this.isEditing) {
                this.initRecipeTypeForm();
            } else {
                // reset recipe type
                this.getRecipeTypeDetail(this.recipeTypeName);
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
            window.open(`/configuration/recipe-types/${e.value.name}`);
        } else {
            this.router.navigate([`/configuration/recipe-types/${e.value.name}`]);
        }
    }

    ngOnInit() {
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = data.results;
        });

        this.initFormGroup();
        this.recipeTypes = [];
        this.recipeTypeOptions = [];
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(routeParams => {
                this.unsubscribeFromForm();
                this.createForm.reset();

                // get name from url
                this.recipeTypeName = routeParams.get('name');

                this.isEditing = this.recipeTypeName === 'create';
                this.items = this.recipeTypeName === 'create' ? _.clone(this.editMenu) : _.clone(this.viewMenu);

                this.getRecipeTypes();
            });
        }
    }

    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
