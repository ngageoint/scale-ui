import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { BatchesApiService } from './api.service';
import { Batch } from './api.model';
import { RecipeType } from '../../configuration/recipe-types/api.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'dev-batch-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class BatchDetailsComponent implements OnInit {
    private routeParams: any;
    createForm: any;
    createFormSubscription: any;
    loading: boolean;
    isEditing: boolean;
    isSaving = false;
    batch: any;
    recipeType: RecipeType;
    recipeTypeOptions: SelectItem[] = [];
    nodeOptions: SelectItem[] = [];
    previousBatchOptions: SelectItem[] = [];
    layoutClass: string;
    validated = false;
    batchID: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private batchesApiService: BatchesApiService
    ) {}

    @HostListener('window:beforeunload')
    @HostListener('window:popstate')
    canDeactivate(): Observable<boolean> | boolean {

        if (this.createForm && this.createForm.dirty && !this.isSaving) {
            return false;
        } else {
            return true;
        }
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
            this.unsubscribeFromForms();
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
        this.isSaving = false;
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
                this.batchID = id;
                this.getBatchDetail(id);
            });
        }
    }
}
