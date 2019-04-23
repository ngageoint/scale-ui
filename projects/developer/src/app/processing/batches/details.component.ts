import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { BatchesApiService } from './api.service';
import { Batch } from './api.model';
import { RecipeType } from '../../configuration/recipe-types/api.model';

@Component({
    selector: 'dev-batch-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class BatchDetailsComponent implements OnInit {
    private routeParams: any;
    private viewMenu: MenuItem[] = [
        { label: 'Edit', icon: 'fa fa-edit', disabled: false, command: () => { this.onEditClick(); } }
    ];
    private editMenu: MenuItem[] = [
        { label: 'Validate', icon: 'fa fa-check', disabled: false, command: () => { this.onValidateClick(); } },
        { label: 'Save', icon: 'fa fa-save', disabled: false, command: () => { this.onSaveClick(); } },
        { separator: true },
        { label: 'Cancel', icon: 'fa fa-remove', disabled: false, command: () => { this.onCancelClick(); } }
    ];
    createForm: any;
    createFormSubscription: any;
    loading: boolean;
    isEditing: boolean;
    batch: any;
    recipeType: RecipeType;
    items: MenuItem[] = _.clone(this.viewMenu);
    recipeTypeOptions: SelectItem[] = [];
    nodeOptions: SelectItem[] = [];
    previousBatchOptions: SelectItem[] = [];
    layoutClass: string;
    validated = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private batchesApiService: BatchesApiService
    ) {}

    private initFormGroups() {
        if (this.batch.id === 'create') {
            this.createForm = this.fb.group({
                title: ['', Validators.required],
                description: [''],
                configuration: this.fb.group({
                    priority: ['']
                })
            });
        } else {
            this.createForm = this.fb.group({
                title: ['', Validators.required],
                description: [''],
                recipe_type: [''],
                definition: this.fb.group({
                    previous_batch: this.fb.group({
                        root_batch_id: [''],
                        forced_nodes: this.fb.group({
                            all: [false],
                            nodes: [''],
                            sub_recipes: ['']
                        })
                    }),
                }),
                configuration: this.fb.group({
                    priority: ['']
                })
            });
        }
    }

    private initValidation() {
        // enable/disable validate and save actions based on form status
        const validateItem = _.find(this.items, { label: 'Validate' });
        if (validateItem) {
            validateItem.disabled = this.createForm.status === 'INVALID';
        }
        const saveItem = _.find(this.items, { label: 'Save' });
        if (saveItem) {
            saveItem.disabled = !this.validated;
        }
    }

    private initBatchForm() {
        if (this.batch) {
            this.initFormGroups();
            // add the remaining values from the object
            this.createForm.patchValue(this.batch);

            // modify form actions based on status
            this.initValidation();
        }

        // listen for changes to createForm fields
        this.createForm.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.batch, changes);
            this.initValidation();
        });
    }

    private initEdit() {
        // set up the form
        this.initBatchForm();
    }

    private getBatchDetail(id: any) {
        if (id > 0) {
            this.loading = true;
            this.batchesApiService.getBatch(id).subscribe(data => {
                this.batch = data;
                this.recipeTypesApiService.getRecipeType(data.recipe_type.name).subscribe(recipeTypeData => {
                    this.loading = false;
                    this.recipeType = recipeTypeData;
                }, err => {
                    this.loading = false;
                    console.log(err);
                    this.messageService.add({severity: 'error', summary: 'Error retrieving recipe type details', detail: err.statusText});
                });
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving batch details', detail: err.statusText});
            });
        } else if (id === 'create') {
            // creating a new batch
            this.isEditing = true;
            this.batch = Batch.transformer(null);
            this.initEdit();
        }
    }

    private unsubscribeFromForms() {
        if (this.createFormSubscription) {
            this.createFormSubscription.unsubscribe();
        }
    }

    private redirect(id: any) {
        if (id === this.batch.id) {
            this.isEditing = false;
            this.items = _.clone(this.viewMenu);
            this.unsubscribeFromForms();
            // this.createForm.reset();
            // this.ingestFileForm.reset();
        } else {
            const url = id ? id === 'create' ? '/processing/batches' : `/processing/batches/${id}` : '/processing/batches';
            this.router.navigate([url]);
        }
    }

    private getRecipeTypes() {
        return this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            const recipeTypes = RecipeType.transformer(data.results);
            _.forEach(recipeTypes, (rt: any) => {
                this.recipeTypeOptions.push({
                    label: rt.title,
                    value: rt
                });
            });
            this.recipeTypeOptions = _.orderBy(this.recipeTypeOptions, ['title'], ['asc']);
        }, err => {
            console.log('Error retrieving recipe types: ' + err);
        });
    }

    onRecipeTypeChange(event) {
        // get batches associated with recipe type
        this.batchesApiService.getBatches({recipe_type_name: event.value.name}).subscribe(data => {
            const batches = Batch.transformer(data.results);
            _.forEach(batches, (b: any) => {
                this.previousBatchOptions.push({
                    label: b.title,
                    value: b.root_batch.id
                });
            });
        });

        // populate node dropdown
        this.recipeTypesApiService.getRecipeType(event.value.name).subscribe(data => {
            _.forEach(data.job_types, jobType => {
                const nodeName = _.findKey(data.definition.nodes, {
                    node_type: {
                        job_type_name: jobType.name,
                        job_type_version: jobType.version
                    }
                });
                this.nodeOptions.push({
                    label: `${jobType.title} v${jobType.version}`,
                    value: nodeName
                });
            });
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving recipe type details', detail: err.statusText});
        });
    }

    onEditClick() {
        this.isEditing = true;
        this.items = _.clone(this.editMenu);
        this.initEdit();
    }

    onValidateClick() {
        this.batchesApiService.validateBatch(this.batch).subscribe(result => {
            if (!result.is_valid) {
                this.validated = false;
                _.forEach(result.warnings, warning => {
                    this.messageService.add({ severity: 'warning', summary: warning.name, detail: warning.description, sticky: true });
                });
                _.forEach(result.errors, error => {
                    this.messageService.add({ severity: 'error', summary: error.name, detail: error.description, sticky: true });
                });
            } else {
                const action = this.batch.id ? 'edited' : 'created';
                this.validated = true;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Validation Successful',
                    detail: `Batch is valid and can be ${action}. Estimated recipes: ${result.recipes_estimated}`,
                    life: 10000
                });
                const saveItem = _.find(this.items, { label: 'Save' });
                if (saveItem) {
                    saveItem.disabled = !this.validated;
                }
            }
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error validating batch', detail: err.statusText});
        });
    }

    onSaveClick() {
        if (this.batch.id) {
            // edit batch
            this.batchesApiService.editBatch(this.batch).subscribe(() => {
                this.messageService.add({severity: 'success', summary: 'Batch edit successful'});
                this.isEditing = false;
                this.createForm.reset();
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error editing batch', detail: err.statusText});
            });
        } else {
            // create batch
            this.batchesApiService.createBatch(this.batch).subscribe(data => {
                console.log(data);
                this.router.navigate([`/processing/batches/${data.id}`]);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error creating batch', detail: err.statusText});
            });
        }
    }

    onCancelClick() {
        this.redirect(this.batch.id || 'create');
    }

    setAllNodes(event) {
        if (event) {
            this.createForm.controls.definition.controls.previous_batch.controls.forced_nodes.controls.nodes.disable();
        } else {
            this.createForm.controls.definition.controls.previous_batch.controls.forced_nodes.controls.nodes.enable();
        }
        this.batch.definition.previous_batch.forced_nodes.all = event;
    }

    onNodesChanged(event) {
        this.batch.definition.previous_batch.forced_nodes.nodes = event.value;
        console.log(this.batch.definition);
    }

    ngOnInit() {
        this.getRecipeTypes();
        let id = null;
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(params => {
                if (this.createForm) {
                    this.unsubscribeFromForms();
                    this.createForm.reset();
                }

                // get id from url, and convert to an int if not null
                id = params.get('id');
                id = id !== null && id !== 'create' ? +id : id;

                this.layoutClass = id === 'create' ? 'p-col-6' : 'p-col-12';
                this.isEditing = id === 'create';
                this.items = id === 'create' ? _.clone(this.editMenu) : _.clone(this.viewMenu);

                this.getBatchDetail(id);
            });
        }
    }
}
