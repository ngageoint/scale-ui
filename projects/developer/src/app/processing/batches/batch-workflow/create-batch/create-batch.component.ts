import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { SelectItem, MessageService } from 'primeng/api';
import * as _ from 'lodash';
import { debounceTime } from 'rxjs/operators';

import { RecipeTypesApiService } from './../../../../configuration/recipe-types/api.service';
import { Batch } from '../../api.model';
import { RecipeType } from 'projects/developer/src/app/configuration/recipe-types/api.model';
import { FormControlWarn, ValidationMessages, multipleInputWarning, priorityRange } from '../../../../common/utils/CustomValidation';
import { onlyUnique } from 'projects/developer/src/app/common/utils/filters';

@Component({
    selector: 'dev-create-batch',
    templateUrl: './create-batch.component.html',
    styleUrls: ['./create-batch.component.scss']
})
export class CreateBatchComponent implements OnInit {
    form: FormGroup;
    @Input() batch: any = {};
    @Input() batchRecipe: any;
    @Output() nextStepEvent = new EventEmitter();
    recipeTypeOptions: SelectItem[] = [];
    nodeOptions: SelectItem[] = [];

    _multipleInputRecipe = false;
    get multipleInputRecipe(): boolean {
        return this._multipleInputRecipe;
    }
    set multipleInputRecipe(value) {
        this._multipleInputRecipe = value;
    }

    titleMessage: string;
    priorityMessage: string;
    recipeTypeMessage: string;
    formValidated = false;

    private validationMessages = {
        title: {
            name: 'titleMessage',
            required: 'Please enter a title for your batch.'
        },
        recipeType: {
            name: 'recipeTypeMessage',
            required: 'Please select a Recipe Type.',
            multipleInput: `The recipe you have selected requires more than one input file. Any newly created dataset
                requires only one input file. Only datasets created via the API that allow for more than one input file will apply.`
        },
        priority: {
            name: 'priorityMessage',
            required: 'Please enter a priority.',
            priorityRange: 'Please enter a value between 0 - 1000000.',
            min: 'Please enter a value between 0 - 1000000.',
            max: 'Please enter a value between 0 - 1000000.'
        }
    };

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
    ) {}

    ngOnInit() {
        this.getRecipeTypes();

        this.form = this.fb.group({
            title: [this.batch ? this.batch.title : '', Validators.required],
            description: [this.batch ? this.batch.description : ''],
            recipe_type: new FormControlWarn(this.batch ? this.batch.recipe_type : '', [
                Validators.required,
                multipleInputWarning
            ]),
            configuration: this.fb.group({
                priority: [
                    this.batch ? this.batch.configuration.priority : '',
                    [Validators.pattern('^[0-9]*$'), priorityRange(0, 1000000)]
                ]
            }),
            supersedes: [this.batch ? this.batch.supersedes : 'true'],
            definition: this.fb.group({
                forced_nodes: this.fb.group({
                    nodes: [this.batch ? this.batch.definition.forced_nodes.nodes : ''],
                })
            })
        });

        if (!this.batch) {
            this.batch = Batch.transformer(null);
        }

        this.form.patchValue(this.batch);

        if (this.batchRecipe) {
            this.populateNodeControl();
        }

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

    handleNextStep(): void {
        this.nextStepEvent.emit({
            createBatch: {
                batch: this.batch,
                batchRecipe: this.batchRecipe,
                multipleInput: this.isMultiInputRecipe()
            },
            index: 1
        });
    }

    handleRecipeTypeChange(value): void {
        if (value) {
            this.recipeTypesApiService.getRecipeType(value.name).subscribe(
                data => {
                    this.batchRecipe = data;
                    this.populateNodeControl();
                    this.setSelectedNodes();
                    this.multipleInputRecipe = this.isMultiInputRecipe();
                    this.setMessage(this.form.get('recipe_type'), this.validationMessages.recipeType);
                },
                err => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error retrieving recipe type details',
                        detail: err.statusText
                    });
                }
            );
        }
    }

    isMultiInputRecipe(): boolean {
        if (!this.batchRecipe) { return false; }
        return this.batchRecipe.definition.input.files
            .map(file => file.name)
            .filter(onlyUnique).length > 1;
    }

    populateNodeControl(): void {
        this.nodeOptions = [];

        this.batchRecipe.job_types.map(jobType => {
            const nodeName = _.findKey(this.batchRecipe.definition.nodes, {
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

        this.batchRecipe.sub_recipe_types.map(subRecipeType => {
            const nodeName = _.findKey(this.batchRecipe.definition.nodes, {
                node_type: {
                    recipe_type_name: subRecipeType.name,
                    recipe_type_revision: subRecipeType.revision_num
                }
            });
            this.nodeOptions.push({
                label: `${subRecipeType.title} rev.${subRecipeType.revision_num}`,
                value: nodeName
            });
        });
    }

    setSelectedNodes(): void {
        const selected = [...this.nodeOptions.map(option => option.value)];
        const nodeControl = this.form.get('definition.forced_nodes.nodes');
        nodeControl.reset();
        nodeControl.setValue(selected);
    }

    getRecipeTypes(): void {
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
        this.batch.definition.forced_nodes.nodes = event.value;
    }

    setMessage(control: AbstractControl | FormControlWarn, validationMessages: ValidationMessages): void {
        this[validationMessages.name] = '';
        if ((control.touched || control.dirty) && control.errors) {
            this[validationMessages.name] = Object.keys(control.errors)
                .map(key => validationMessages[key]).join(' ');
        }
        if (control instanceof FormControlWarn) {
            if ((control.touched || control.dirty) && this.isMultiInputRecipe() && control.warnings) {
                this[validationMessages.name] = Object.keys(control.warnings)
                    .map(key => validationMessages[key]).join(' ');
            }
        }
    }
}
