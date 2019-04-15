import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
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

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private batchesApiService: BatchesApiService
    ) {}

    private initFormGroups() {
        this.createForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            recipe_type: [''],
            definition: this.fb.group({
                previous_batch: this.fb.group({
                    root_batch_id: ['']
                }),
                job_names: this.fb.array([])
            }),
            configuration: this.fb.group({
                priority: ['']
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

    private initBatchForm() {
        if (this.batch) {
            // disable the name field if editing an existing batch
            if (this.batch.id) {
                this.createForm.get('name').disable();
            }

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

    onEditClick() {
        this.isEditing = true;
        this.items = _.clone(this.editMenu);
        this.initEdit();
    }

    onValidateClick() {
        // validate batch
    }

    onSaveClick() {
        this.createForm.reset();
        if (this.batch.id) {
            // edit batch
        } else {
            // create batch
        }
    }

    onCancelClick() {
        this.redirect(this.batch.id || 'create');
    }

    ngOnInit() {
        this.initFormGroups();
        let id = null;
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(params => {
                this.unsubscribeFromForms();
                this.createForm.reset();

                // get id from url, and convert to an int if not null
                id = params.get('id');
                id = id !== null && id !== 'create' ? +id : id;

                this.isEditing = id === 'create';
                this.items = id === 'create' ? _.clone(this.editMenu) : _.clone(this.viewMenu);

                this.getBatchDetail(id);
            });
        }
    }
}
