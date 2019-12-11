import { BehaviorSubject } from 'rxjs';
import { RecipeTypesApiService } from './../../../../configuration/recipe-types/api.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatasetsApiService } from './../../../../data/services/dataset.api.service';
import { SelectItem, MessageService } from 'primeng/primeng';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { BatchesApiService } from '../../api.service';
import { Batch } from '../../api.model';
import * as _ from 'lodash';
import { RecipeType } from 'projects/developer/src/app/configuration/recipe-types/api.model';

@Component({
    selector: 'dev-create-batch',
    templateUrl: './create-batch.component.html',
    styleUrls: ['./create-batch.component.scss']
})
export class CreateBatchComponent implements OnInit {
    form: FormGroup;
    datasetOptions: SelectItem[] = [];
    selectedDataset: any;
    batch: any;
    recipeTypeOptions: SelectItem[] = [];
    private _selectedRecipeType = new BehaviorSubject<any>(null);

    @Input()
    set selectedRecipeType(value) {
        this._selectedRecipeType.next(value);
    }
    get selectedRecipeType() {
        return this._selectedRecipeType.getValue();
    }

    previousBatchOptions: SelectItem[] = [];
    nodeOptions: SelectItem[] = [];
    @Output() valueChange = new EventEmitter();

    constructor(
        private datasetApiService: DatasetsApiService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private batchesApiService: BatchesApiService
    ) {

    }

    ngOnInit() {
        this.getDatasets();
        this.getRecipeTypes();
        this.form = this.fb.group({
            title: [''],
            description: [''],
            dataset: [''],
            recipe_type: [''],
            definition: this.fb.group({
                previous_batch: this.fb.group({
                    root_batch_id: [''],
                    forced_nodes: this.fb.group({
                        all: [false],
                        nodes: [''],
                        sub_recipes: ['']
                    })
                })
            })
        });
        this.getBatchDetail();

        this._selectedRecipeType.subscribe(value => {
            if (value) {
                this.form.get('recipe_type').patchValue(value);

                this.batchesApiService.getBatches({recipe_type_name: value.name}).subscribe(data => {
                    const batches = Batch.transformer(data.results);
                    _.forEach(batches, (b: any) => {
                        this.previousBatchOptions.push({
                            label: b.title,
                            value: b.root_batch.id
                        });
                    });
                });

                // populate node dropdown
                this.recipeTypesApiService.getRecipeType(value.name).subscribe(data => {
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
        });
    }

    onRunClick() {
        console.log('Run Batch.');
    }

    onSaveClick() {
        console.log('Save Batch.');
        // debugger;
        this.batchesApiService.createBatch(this.batch);
    }

    getDatasets() {

        this.datasetApiService.getDatasets({}).subscribe(data => {
            data.results.map(dataset => {
                this.datasetOptions.push({
                    label: dataset.title,
                    value: dataset
                });
            });
        });
    }

    getRecipeTypes() {
        this.recipeTypesApiService.getRecipeTypes({rows: 100000}).subscribe(data => {
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

    onDatasetChangeHandler(event) {
        // debugger;
        this.valueChange.emit(this.form.get('dataset').value);
    }

    onRecipeTypeChange(event) {
        this.selectedRecipeType = event.value;
    }



    onNodesChanged(event) {
        this.batch.definition.previous_batch.forced_nodes.nodes = event.value;
        console.log(this.batch.definition);
    }

    setAllNodes(event) {
        if (event) {
            debugger;
            this.form.get('nodes').disable();
            // this.form.controls.definition.controls.previous_batch.controls.forced_nodes.controls.nodes.disable();
        } else {
            this.form.get('nodes').enable();
            // this.form.controls.definition.controls.previous_batch.controls.forced_nodes.controls.nodes.enable();
        }
        this.batch.definition.previous_batch.forced_nodes.all = event;
    }

    private getBatchDetail() {
        this.batch = Batch.transformer(null);
        this.initBatchForm();
    }

    private initBatchForm() {
        if (this.batch) {
            // add the remaining values from the object
            this.form.patchValue(this.batch);

            // modify form actions based on status
        }

        // listen for changes to createForm fields
        this.form.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.batch, changes);
        });
    }
}
