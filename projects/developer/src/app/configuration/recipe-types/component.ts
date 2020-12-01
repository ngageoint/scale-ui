import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
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
import { Observable } from 'rxjs';
import { Globals } from '../../globals';

@Component({
    selector: 'dev-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RecipeTypesComponent implements OnInit, OnDestroy {
    @ViewChild('dv', {static: true}) dv: any;
    @ViewChild('addRemoveDialog', {static: true}) addRemoveDialog: Dialog;
    @ViewChild('menu', {static: false}) menu: any;

    private routeParams: any;
    private _isEditing = false;
    isSaving = false;
    showActive = true;
    activeLabel = 'Active Recipe Types';
    loadingRecipeTypes: boolean;
    validated: boolean;
    quanity = {};
    totalRecords: number;
    addRemoveDialogX: number;
    addRemoveDialogY: number;
    createForm: any;
    createFormSubscription: any;
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
    recipeTypeOptions: any[]; // used for main recipe types dataview
    selectedRecipeTypeDetail: any;
    selectedJobTypeDetail: any;
    addedRecipeNode: any;
    addedJobNode: any;
    addedConditionalNode: any;
    condition: any = RecipeTypeCondition.transformer(null);
    editCondition: RecipeTypeCondition;
    conditions: any = [];
    selectedConditions = [];
    conditionColumns: any[];
    showAddRemoveDisplay: boolean;
    addRemoveDisplayType = 'job';
    globals: Globals;
    menuBarItems: MenuItem[] = [
        { label: 'Job Type Nodes', icon: 'fa fa-cube',
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

    get isEditing(): boolean {
        return this._isEditing;
    }
    set isEditing(value: boolean) {
        this._isEditing = value;
    }

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private jobTypesApiService: JobTypesApiService,
        private dataService: DataService,
        private router: Router,
        private route: ActivatedRoute,
        globals: Globals
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
        this.globals = globals;
    }

    @HostListener('window:beforeunload')
    @HostListener('window:popstate')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.createForm.dirty && !this.isSaving) {
            return false;
        } else {
            if ( (this.addedJobNode || this.addedRecipeNode || this.addedConditionalNode) && !this.isSaving ) {
                return false;
            } else {
                return true;
            }
        }
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
            description: [''],
            definition: this.fb.group({
                input: this.fb.group({
                    files: this.fb.array([]),
                    json: this.fb.array([])
                })
            })
        });
    }

    private initRecipeTypeForm() {
        if (this.selectedRecipeTypeDetail) {
            // add the values from the object
            this.createForm.patchValue(this.selectedRecipeTypeDetail);
        }

        // listen for changes to createForm fields
        this.createFormSubscription = this.createForm.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            this.selectedRecipeTypeDetail.title = changes.title;
            this.selectedRecipeTypeDetail.description = changes.description;
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

            // load in condition nodes if available
            if (this.selectedRecipeTypeDetail.conditions) {
                this.selectedRecipeTypeDetail.conditions.forEach(c => {
                    // parse the condition node data
                    const condition = RecipeTypeCondition.transformer(c);

                    // add the condition both to the list to display, as well as the list with selected values
                    this.conditions.push(condition);
                    this.selectedConditions.push(condition);
                });
            }
        }, err => {
            console.log(err);
            this.loadingRecipeType = false;
        });
    }

    private getRecipeTypes(params?: any) {
        this.loadingRecipeTypes = true;
        params = params || {
            rows: 1000,
            is_active: this.showActive,
            sortField: 'title'
        };
        this.recipeTypeOptions = [];
        this.showAddRemoveDisplay = false;
        this.selectedRecipeTypes = [];
        this.recipeTypesApiService.getRecipeTypes(params).subscribe(data => {
            this.recipeTypes = _.orderBy(data.results, ['title'], ['asc']);
            if (!this.recipeTypeName) {
                // show grid of recipe types
                this.totalRecords = data.count;
                _.forEach(data.results, result => {
                    this.recipeTypeOptions.push({
                        label: result.title,
                        value: result,
                        menuItems: [{
                            label: result.deprecated ? 'Activate' : 'Deprecate',
                            icon: result.deprecated ? 'fa fa-toggle-off' : 'fa fa-toggle-on',
                            value: result,
                            command: (event: any) => {
                                this.onDeprecateClick(event.item.value);
                            }
                        }]
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
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving recipe types', detail: err.statusText});
        });
    }

    /**
     * Action when deprecating/activating a recipe type.
     * @param recipeType the recipe type that was clicked
     */
    private onDeprecateClick(recipeType: any): void {
        this.recipeTypesApiService
            .editRecipeType(recipeType.name, {is_active: !recipeType.is_active})
            .subscribe(() => {
                this.getRecipeTypes();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `${recipeType.title} successfully edited`
                });
            }, err => {
                console.log(err);
                this.messageService.add({ severity: 'error', summary: 'Error editing recipe type', detail: err.statusText });
            });
    }

    private unsubscribeFromForms() {
        if (this.createFormSubscription) {
            this.createFormSubscription.unsubscribe();
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

    onQuanityChange(quantity, data, type ) {
        console.log(quantity);
        if (type === 'job') {
            for (let i = 1; i <= quantity; i++) {
                const key  = (data.name + '-' + i);
                console.log(key);
                this.addJobTypeNode(data, key);
            }
        } else if (type === 'recipe') {
            for (let i = 1; i <= quantity; i++) {
                const key  = (data.name + '-' + i);
                console.log(key);
                this.addRecipeTypeNode(data, key);
            }
        }
     }

    addJobTypeNode(event, key) {
        console.log(event);
        this.addedJobNode = event;
        // get job type detail in order to obtain the interface
        this.jobTypesApiService.getJobType(this.addedJobNode.name, this.addedJobNode.version).subscribe(data => {
            if (data && data.manifest.seedVersion) {
                const recipeData = _.cloneDeep(this.selectedRecipeTypeDetail);
                if (!recipeData.job_types) {
                    recipeData.job_types = [];
                }
                const input = {};
                if (data.manifest.job.interface) {
                    _.forEach(data.manifest.job.interface.inputs, inputType => {
                        _.forEach(inputType, it => {
                            input[it.name] = {};
                        });
                    });
                }
                recipeData.definition.nodes[key] = {
                    dependencies: [],
                    input: input,
                    node_type: {
                        node_type: 'job',
                        job_type_name: data.manifest.job.name,
                        job_type_version: data.manifest.job.jobVersion,
                        job_type_revision: data.revision_num
                    }
                };
                console.log(recipeData);
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

    addRecipeTypeNode(event, key) {
        this.addedRecipeNode = event.data;
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
            recipeData.definition.nodes[key] = {
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
        this.addedConditionalNode = event.data;

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
            // check for any dependencies that reference this node and remove them
            _.forEach(recipeData.definition.nodes, node => {
                if (node.dependencies && node.dependencies.length > 0) {
                    _.remove(node.dependencies, (dependency: any) => {
                        return dependency.name === event.data.name;
                    });
                }
            });
            // remove associated metadata
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
            // delete node from recipe
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

    onEditClick() {
        // todo add warning that changes will be discarded
        this.isEditing = !this.isEditing;
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

    toggleShowActive() {
        this.activeLabel = this.showActive ? 'Active Recipe Types' : 'Deprecated Recipe Types';
        this.getRecipeTypes();
    }

    validateRecipeType() {
        const cleanRecipeType = RecipeType.cleanRecipeTypeForValidate(this.selectedRecipeTypeDetail);
        this.recipeTypesApiService.validateRecipeType(cleanRecipeType).subscribe(result => {
            this.validated = result.is_valid;
            if (result.is_valid) {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Validation Successful',
                    detail: 'Recipe Type is valid and can be created.'
                });
            }
            _.forEach(result.warnings, warning => {
                this.messageService.add({ severity: 'warn', summary: warning.name, detail: warning.description, sticky: true });
            });
            _.forEach(result.errors, error => {
                if (error.name.endsWith('JSON')) {
                    const errors = JSON.parse(error.description);
                    // Remove the _JSON in the name.
                    const name = error.name.substring(0, error.name.length - 5);

                    for (const detail of errors) {
                        this.messageService.add({ severity: 'error', summary: name, detail, sticky: true });
                    }
                } else {
                    this.messageService.add({ severity: 'error', summary: error.name, detail: error.description, sticky: true });
                }
            });
        }, err => {
            console.log(err);
            this.messageService.add({ severity: 'error', summary: 'Error validating recipe type', detail: err.statusText });
        });
    }

    saveRecipeType() {
        this.isSaving = true;
        const cleanRecipeType: any = RecipeType.cleanRecipeTypeForSave(this.selectedRecipeTypeDetail);
        if (this.recipeTypeName === 'create') {
            this.recipeTypesApiService.createRecipeType(cleanRecipeType).subscribe(result => {
                this.isEditing = false;
                this.showAddRemoveDisplay = false;
                this.showFileInputs = false;
                this.showJsonInputs = false;
                this.showConditions = false;
                this.selectedRecipeTypeDetail = RecipeType.transformer(result);
                this.recipeTypeName = this.selectedRecipeTypeDetail.name;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `${result.title} successfully created` });
                // modify url without reloading view
                window.history.pushState({}, '', `/configuration/recipe-types/${result.name}`);
            }, err => {
                console.log(err);
                this.messageService.add({ severity: 'error', summary: 'Error creating recipe type', detail: err.statusText });
            });
        } else {
            this.recipeTypesApiService.editRecipeType(this.selectedRecipeTypeDetail.name, cleanRecipeType).subscribe(() => {
                this.isEditing = false;
                this.showAddRemoveDisplay = false;
                this.showFileInputs = false;
                this.showJsonInputs = false;
                this.showConditions = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `${this.selectedRecipeTypeDetail.title} successfully edited`
                });
            }, err => {
                console.log(err);
                this.messageService.add({ severity: 'error', summary: 'Error editing recipe type', detail: err.statusText });
            });
        }
    }

    getUnicode(code) {
        return `&#x${code};`;
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

    /**
     * Callback for when the condition editor panel has been saved with a valid condition.
     * @param condition the edited conditional node
     */
    onConditionSave(event: {condition: RecipeTypeCondition, previousCondition: RecipeTypeCondition}): void {
        if (event.previousCondition.name) {
            // update local conditions model
            const idx = _.findIndex(this.conditions, {name: event.condition.name});
            this.conditions[idx] = event.condition;

            // update the fields of the existing node in the recipe data
            // this is same idea as addConditionNode()
            this.selectedRecipeTypeDetail.definition.nodes[event.condition.name].node_type.name = event.condition.name;
            this.selectedRecipeTypeDetail.definition.nodes[event.condition.name].node_type.interface = event.condition.interface;
            this.selectedRecipeTypeDetail.definition.nodes[event.condition.name].node_type.data_filter = event.condition.data_filter;

            // update condition node in recipe details
            // same idea as RecipeType.addCondition(), but update it here as well
            const cidx = _.findIndex(this.selectedRecipeTypeDetail.conditions, {name: event.condition.name});
            this.selectedRecipeTypeDetail.conditions[cidx] = event.condition;
        } else {
            this.conditions.push(event.condition);
        }
    }

    /**
     * Callback for when the conditional editor is closed from within.
     * @param  e whether or not the editor should be visible
     */
    onConditionCancel(e: boolean): void {
        this.showConditions = false;
    }

    /**
     * Callback for when the recipe graph outputs the click event to delete a condition node.
     * @param condition the condition node to delete.
     */
    onDeleteCondition(condition: RecipeTypeCondition): void {
        _.remove(this.conditions, { name: condition.name });
        const nodeToRemove = this.selectedRecipeTypeDetail.definition.nodes[condition.name];
        if (nodeToRemove) {
            this.removeNode({
                data: condition
            });
        }
    }

    /**
     * Callback for when the recipe graph outputs the click event to edit a condition node.
     * @param condition the condition node to edit
     */
    onEditCondition(condition: RecipeTypeCondition): void {
        // this will be cleared when the sidebar is hidden
        this.editCondition = condition;
        this.showConditions = true;
    }

    /**
     * Callback for when the condition side bar is hidden.
     */
    onConditionSidebarHide(): void {
        this.editCondition = null;
    }

    onFilterKeyup(e) {
        this.dv.filter(e.target.value);
        this.clampText();
    }

    /**
     * Get the router link to the recipe type URL.
     * @param  recipeType the recipe type data with a name field
     * @return            link to recipe type page
     */
    getRecipeTypeURL(recipeType: any): string {
        return `/configuration/recipe-types/${recipeType.name}`;
    }

    /**
     * Menu click even for dropdown in each entry of the recipe types list.
     * @param event      primeng click event
     * @param recipeType recipe type this menu was clicked for
     */
    onMenuClick(event: any, recipeType: any): void {
        this.menu.model = recipeType.menuItems;
        this.menu.toggle(event);
        event.stopPropagation();
    }

    ngOnInit() {
        this.isSaving = false;
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = _.orderBy(data.results, ['title', 'version'], ['asc', 'asc']);
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
