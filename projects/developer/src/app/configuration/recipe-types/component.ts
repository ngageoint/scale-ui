import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { LazyLoadEvent, MenuItem, SelectItem } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { MessageService } from 'primeng/components/common/messageservice';
import webkitLineClamp from 'webkit-line-clamp';
import * as _ from 'lodash';

import { RecipeTypesApiService } from './api.service';
import { JobTypesApiService } from '../job-types/api.service';
import { DataService } from '../../common/services/data.service';
import { RecipeType } from './api.model';
import { RecipeTypeInput } from './api.input.model';
import { RecipeTypeCondition } from './api.condition.model';

@Component({
    selector: 'dev-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipeTypesComponent implements OnInit, OnDestroy {
    @ViewChild('dv') dv: any;
    @ViewChild('addRemoveDialog') addRemoveDialog: Dialog;
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
    filterItems: MenuItem[] = [
        { label: 'Inactive', icon: 'fa fa-circle-o', command: () => { this.toggleInactive(); } }
    ];
    filterBtnClass = 'ui-button-secondary';
    showInactive: boolean;
    loadingRecipeTypes: boolean;
    isInitialized: boolean;
    rows = 16;
    totalRecords: number;
    recipeGraphMinHeight = '70vh';
    addRemoveDialogX: number;
    addRemoveDialogY: number;
    createForm: any;
    createFormSubscription: any;
    conditionForm: any;
    conditionFormSubscription: any;
    showFileInputs: boolean;
    showJsonInputs: boolean;
    showConditions: boolean;
    jobTypeColumns: any[];
    recipeTypeColumns: any[];
    loadingRecipeType: boolean;
    recipeTypeName: string;
    jobTypes: any;
    selectedJobTypes = [];
    recipeTypes: any; // used for adding/removing recipe nodes from recipe
    selectedRecipeTypes = []; // used for adding/removing recipe nodes from recipe
    recipeTypeOptions: SelectItem[]; // used for main recipe types dataview
    selectedRecipeTypeDetail: any;
    condition: any = RecipeTypeCondition.transformer(null);
    conditions: any = [];
    selectedConditions = [];
    conditionColumns: any[];
    showAddRemoveDisplay: boolean;
    addRemoveDisplayType = 'job';
    isEditing: boolean;
    items: MenuItem[] = _.clone(this.viewMenu);
    menuBarItems: MenuItem[] = [
        { label: 'Job Nodes', icon: 'fa fa-cube',
            command: () => {
                this.addRemoveDisplayType = 'job';
                this.showAddRemoveDisplay = true;
            }
        },
        { label: 'Recipe Nodes', icon: 'fa fa-cubes',
            command: () => {
                this.addRemoveDisplayType = 'recipe';
                this.showAddRemoveDisplay = true;
            }
        },
        { label: 'Condition Nodes', icon: 'fa fa-adjust',
            command: () => {
                this.addRemoveDisplayType = 'condition';
                this.showAddRemoveDisplay = true;
            }
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
        this.conditionColumns = [
            { field: 'name', header: 'Name', filterMatchMode: 'contains' }
        ];
    }

    private clampText() {
        setTimeout(() => {
            const clampEls = document.getElementsByClassName('clamp');
            _.forEach(clampEls, el => {
                webkitLineClamp(el, 3);
            });
            // container elements are hidden by default to prevent flash of unstyled content
            const containerEls = document.getElementsByClassName('recipe-type__container');
            _.forEach(containerEls, (el: any) => {
                el.style.visibility = 'visible';
            });
        });
    }

    private initFormGroups() {
        this.createForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            definition: this.fb.group({
                input: this.fb.group({
                    files: this.fb.array([]),
                    json: this.fb.array([])
                })
            })
        });

        this.conditionForm = this.fb.group({
            name: [this.condition.name, Validators.required],
            data_filter: this.fb.group({
                filters: this.fb.array(this.condition.data_filter.filters, Validators.required),
                all: [true]
            })
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

        this.conditionFormSubscription = this.conditionForm.valueChanges.subscribe(changes => {
            _.merge(this.condition, changes);
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

    private getRecipeTypes(params?: any) {
        this.loadingRecipeTypes = true;
        params = params || {
            first: 0,
            rows: this.rows,
            is_active: this.showInactive ? null : true,
            sortField: 'title'
        };
        this.recipeTypeOptions = [];
        this.showAddRemoveDisplay = false;
        this.selectedRecipeTypes = [];
        this.recipeTypesApiService.getRecipeTypes(params).subscribe(data => {
            if (!this.recipeTypeName) {
                // show grid of recipe types
                this.totalRecords = data.count;
                this.recipeTypes = data.results;
                _.forEach(data.results, result => {
                    this.recipeTypeOptions.push({
                        label: result.title,
                        value: result
                    });
                });
                this.recipeTypeOptions = _.orderBy(this.recipeTypeOptions, ['value.title'], ['asc']);
                this.clampText();
                this.loadingRecipeTypes = false;
            } else {
                // show recipe type details
                if (this.recipeTypeName !== 'create') {
                    this.isEditing = false;
                    this.getRecipeTypeDetail(this.recipeTypeName);
                } else {
                    this.selectedRecipeTypeDetail = new RecipeType(
                        null,
                        null,
                        'Untitled Recipe',
                        null,
                        true,
                        false,
                        null,
                        {
                            input: new RecipeTypeInput([], []),
                            nodes: {}
                        },
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

    private unsubscribeFromForms() {
        if (this.createFormSubscription) {
            this.createFormSubscription.unsubscribe();
        }

        if (this.conditionFormSubscription) {
            this.conditionFormSubscription.unsubscribe();
        }
    }

    createNewRecipe() {
        this.selectedJobTypes = [];
        this.router.navigate(['/configuration/recipe-types/create']);
    }

    showDialog() {
        if (this.addRemoveDialogX && this.addRemoveDialogY) {
            this.addRemoveDialog.positionLeft = this.addRemoveDialogX;
            this.addRemoveDialog.positionTop = this.addRemoveDialogY;
        }
    }

    hideDialog() {
        const addRemoveDialogDiv: HTMLElement = document.querySelector('.add-remove-dialog');
        this.addRemoveDialogX = addRemoveDialogDiv ? parseInt(addRemoveDialogDiv.style.left, 10) : null;
        this.addRemoveDialogY = addRemoveDialogDiv ? parseInt(addRemoveDialogDiv.style.top, 10) : null;
    }

    addJobTypeNode(event) {
        const jobType = event.data;
        // get job type detail in order to obtain the interface
        this.jobTypesApiService.getJobType(jobType.name, jobType.version).subscribe(data => {
            if (data && data.manifest.seedVersion) {
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
            } else {
                this.messageService.add({severity: 'error', summary: `${data.title} is not seed compliant`, life: 10000});
                // remove job type from selection
                this.selectedJobTypes = _.filter(this.selectedJobTypes, jt => {
                    return jt.name !== event.data.name && jt.version !== event.data.version;
                });
            }
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type details', detail: err.statusText});
            // remove job type from selection
            this.selectedJobTypes = _.filter(this.selectedJobTypes, jt => {
                return jt.name !== event.data.name && jt.version !== event.data.version;
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
                    if (it.name) {
                        input[it.name] = {};
                    }
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

    addConditionNode(event) {
        const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
        recipeData.definition.nodes[event.data.name] = {
            dependencies: [],
            input: {},
            node_type: {
                node_type: 'condition',
                name: event.data.name,
                interface: event.data.interface,
                data_filter: event.data.data_filter
            }
        };
        recipeData.addCondition(event.data);
        this.selectedRecipeTypeDetail = recipeData;
    }

    removeNode(event) {
        const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
        const nodeToRemove = recipeData.definition.nodes[event.data.name];
        if (nodeToRemove) {
            if (nodeToRemove.node_type.node_type === 'job') {
                _.remove(recipeData.job_types, (jt: any) => {
                    return jt.name === event.data.name && jt.version === event.data.version;
                });
            } else if (nodeToRemove.node_type.node_type === 'recipe') {
                _.remove(recipeData.sub_recipe_types, (rt: any) => {
                    return rt.name === event.data.name && rt.revision_num === event.data.revision_num;
                });
            } else if (nodeToRemove.node_type.node_type === 'condition') {
                _.remove(recipeData.conditions, (c: any) => {
                    return c.name === event.data.name;
                });
            }
            delete recipeData.definition.nodes[event.data.name];
            this.selectedRecipeTypeDetail = recipeData;
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error removing node',
                detail: 'Unable to find node in recipe definition'
            });
        }
    }

    toggleEdit() {
        // todo add warning that changes will be discarded
        this.isEditing = !this.isEditing;
        this.recipeGraphMinHeight = this.isEditing ? '35vh' : '70vh';
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

    toggleFileInputs() {
        this.showFileInputs = !this.showFileInputs;
    }

    toggleJsonInputs() {
        this.showJsonInputs = !this.showJsonInputs;
    }

    toggleConditions() {
        this.showConditions = !this.showConditions;
    }

    onToggleClick(e) {
        e.originalEvent.preventDefault();
    }

    onAddConditionClick() {
        this.conditions.push(RecipeTypeCondition.transformer(this.condition));
        this.conditionForm.reset();
        this.condition = RecipeTypeCondition.transformer(null);
    }

    onRemoveConditionClick(condition) {
        _.remove(this.conditions, { name: condition.name });
        const nodeToRemove = this.selectedRecipeTypeDetail.definition.nodes[condition.name];
        if (nodeToRemove) {
            this.removeNode({
                data: condition
            });
        }
    }

    onFilterKeyup(e) {
        this.dv.filter(e.target.value);
        this.clampText();
    }

    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            this.getRecipeTypes({
                first: e.first,
                rows: e.rows,
                sortField: 'title'
            });
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }

    onRecipeTypeClick(e, recipeType) {
        if (e.ctrlKey || e.metaKey) {
            window.open(`/configuration/recipe-types/${recipeType.value.name}`);
        } else {
            this.router.navigate([`/configuration/recipe-types/${recipeType.value.name}`]);
        }
    }

    toggleInactive() {
        this.showInactive = !this.showInactive;
        this.filterBtnClass = this.showInactive ? 'ui-button-info' : 'ui-button-secondary';
        const inactiveItem: any = _.find(this.filterItems, { label: 'Inactive' });
        inactiveItem.icon = this.showInactive ? 'fa fa-circle' : 'fa fa-circle-o';
        this.getRecipeTypes();
    }

    ngOnInit() {
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = data.results;
        });

        this.initFormGroups();
        this.recipeTypes = [];
        this.recipeTypeOptions = [];
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(routeParams => {
                this.unsubscribeFromForms();
                this.createForm.reset();

                // get name from url
                this.recipeTypeName = routeParams.get('name');

                this.isEditing = this.recipeTypeName === 'create';
                this.recipeGraphMinHeight = this.isEditing ? '35vh' : '70vh';
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
