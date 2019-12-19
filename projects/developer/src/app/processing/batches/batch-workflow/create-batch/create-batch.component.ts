import { RecipeTypesApiService } from './../../../../configuration/recipe-types/api.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { SelectItem, MessageService } from 'primeng/primeng';
import { Component, OnInit } from '@angular/core';
import { BatchesApiService } from '../../api.service';
import { Batch } from '../../api.model';
import * as _ from 'lodash';
import { RecipeType } from 'projects/developer/src/app/configuration/recipe-types/api.model';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'dev-create-batch',
    templateUrl: './create-batch.component.html',
    styleUrls: ['./create-batch.component.scss']
})
export class CreateBatchComponent implements OnInit {
    form: FormGroup;
    batch: any;
    recipeTypeOptions: SelectItem[] = [];
    titleMessage: string;
    priorityMessage: string;
    formValidated = false;
    private validationMessages = {
        title: {
            name: 'titleMessage',
            required: 'Please enter a title for your batch.'
        },
        recipeType: {
            name: 'recipeTypeMessage',
            required: 'Please select a Recipe Type.'
        },
        priority: {
            name: 'priorityMessage',
            required: 'Please enter a priority.',
            min: 'Please enter a value between 0 - 1000000.',
            max: 'Please enter a value between 0 - 1000000.'
        }
    };
    nodeOptions: SelectItem[] = [];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private batchesApiService: BatchesApiService
    ) {}

    ngOnInit() {
        this.getRecipeTypes();

        this.form = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            recipe_type: ['', Validators.required],
            configuration: this.fb.group({
                priority: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(0), Validators.max(1000000)]]
            }),
            supersedes: [false],
            definition: this.fb.group({
                previous_batch: this.fb.group({
                    forced_nodes: this.fb.group({
                        all: [false],
                        nodes: [''],
                        sub_recipes: ['']
                    })
                })
            })
        });

        this.batch = Batch.transformer(null);
        this.form.patchValue(this.batch);

        const titleControl = this.form.get('title');
        titleControl.valueChanges
            .pipe(debounceTime(1000))
            .subscribe(() => {
                this.setMessage(titleControl, this.validationMessages.title);
            });

        const priorityControl = this.form.get('configuration.priority');
        priorityControl.valueChanges
            .pipe(debounceTime(1000))
            .subscribe(() => {
                this.setMessage(priorityControl, this.validationMessages.priority);
            });


        this.form.get('recipe_type').valueChanges.subscribe(value => {
            this.handleRecipeTypeChange(value);
        });

        this.form.valueChanges.pipe(debounceTime(1000)).subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.batch, changes);
        });
    }

    validateBatch() {
        return this.batchesApiService.validateBatch(this.batch)
            .subscribe(value => {
                this.formValidated = value.is_valid;
                this.form.markAsPristine();
            });
    }

    handleRecipeTypeChange(value) {
        this.nodeOptions = [];
        if (value) {
            // populate node dropdown
            this.recipeTypesApiService.getRecipeType(value.name).subscribe(
                data => {
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
                },
                err => {
                    console.log(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error retrieving recipe type details',
                        detail: err.statusText
                    });
                }
            );
        }
    }

    getRecipeTypes() {
        this.recipeTypesApiService.getRecipeTypes({ rows: 100000 }).subscribe(
            data => {
                const recipeTypes = RecipeType.transformer(data.results);
                _.forEach(recipeTypes, (rt: any) => {
                    this.recipeTypeOptions.push({
                        label: rt.title,
                        value: rt
                    });
                });
                this.recipeTypeOptions = _.orderBy(
                    this.recipeTypeOptions,
                    ['title'],
                    ['asc']
                );
            },
            err => {
                console.log('Error retrieving recipe types: ' + err);
            }
        );
    }

    onNodesChanged(event) {
        this.batch.definition.previous_batch.forced_nodes.nodes = event.value;
    }

    setMessage(control: AbstractControl, validationMessages: ValidationMessages): void {
        this[validationMessages.name] = '';
        if ((control.touched || control.dirty) && control.errors) {
            this[validationMessages.name] = Object.keys(control.errors)
                .map(key => validationMessages[key]).join(' ');
        }
    }

    setAllNodes(event) {
        if (event) {
            this.form
                .get('definition.previous_batch.forced_nodes.nodes')
                .disable();
        } else {
            this.form
                .get('definition.previous_batch.forced_nodes.nodes')
                .enable();
        }
        this.batch.definition.previous_batch.forced_nodes.all = event;
    }
}

export interface ValidationMessages {
    'name': string;
    [key: string]: string;
}
