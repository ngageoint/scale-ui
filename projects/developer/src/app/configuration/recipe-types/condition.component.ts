import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

import { RecipeTypeCondition } from './api.condition.model';


@Component({
    selector: 'dev-recipe-type-condition',
    templateUrl: './condition.component.html',
    styleUrls: ['./condition.component.scss']
})
export class RecipeTypeConditionComponent implements OnInit, OnDestroy {
    @Input() editCondition: RecipeTypeCondition;
    @Input() conditions: RecipeTypeCondition[];
    @Output() save: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    private condition = RecipeTypeCondition.transformer(this.editCondition);
    private oldCondition: RecipeTypeCondition;
    private subscriptions: Subscription[] = [];

    // whether or not in edit mode, based on if editCondition is provided
    isEditing = false;

    // main form that will be saved
    form: FormGroup;

    // opened filter in the accordion group
    accordionIndex = 0;

    // options for the select buttons between and/or
    allOptions = [
        { value: true, label: 'AND', description: 'All filters should pass' },
        { value: false, label: 'OR', description: 'At least one filter needs to pass' },
    ];

    /** Alias to get the filters array from the form */
    get filters(): FormArray {
        return this.form.get('data_filter').get('filters') as FormArray;
    }

    constructor(
        private fb: FormBuilder
    ) {
    }

    /**
     * Helper to add a new filter form group and expand the accordion to that position.
     * @param data any data available to initialize the form group
     */
    addFilter(data: any = {}): void {
        const values = data.values || [];

        const group = this.fb.group({
            name: [data.name || '', Validators.required],
            type: [data.type || '', Validators.required],
            condition: [data.condition || '', Validators.required],
            values: this.fb.array(
                values.map(v => this.fb.control(v))
            )
        });

        this.filters.push(group);
        this.accordionIndex = this.filters.length - 1;
    }

    /**
     * Removes the filter group at the given position.
     * @param idx index of the filter to remove
     */
    removeFilter(idx: number): void {
        this.filters.removeAt(idx);
    }

    /**
     * Form validator function to check that the condition name is not already in use.
     * @return validator function
     */
    private existingConditionsValidator(): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} | null => {
            if (this.conditions) {
                const existingNames = this.conditions.map(c => c.name);
                if (existingNames.indexOf(control.value) !== -1) {
                    return {'forbiddenName': {value: control.value}};
                }
            }
            return null;
        };
    }

    /**
     * On save, emit to the output this condition, then close the dialog.
     */
    saveClick(): void {
        this.save.next({condition: this.condition, previousCondition: this.oldCondition});
        this.cancelClick();
    }

    /**
     * Cancels/closes the dialog.
     */
    cancelClick(): void {
        this.cancel.next(true);
    }

    ngOnInit() {
        // create a copy of the passed in edit condition, if any
        // will create an empty condition if given null value
        this.oldCondition = RecipeTypeCondition.transformer(this.editCondition) as RecipeTypeCondition;

        // build the form
        this.form = this.fb.group({
            name: [this.oldCondition.name || '', [
                Validators.required,
                Validators.pattern(/^[a-zA-Z_-]+$/),
                this.existingConditionsValidator()
            ]],
            data_filter: this.fb.group({
                filters: this.fb.array([], Validators.required),
                all: [this.oldCondition.data_filter.all, Validators.required],
            })
        });

        // for editing, disable changing the condition name
        // since nodes are keyed off of this value, links in the graph would have to be updated
        if (this.editCondition) {
            this.isEditing = true;
            this.form.get('name').disable();
        }

        // if filters array is provided in the edit condition, add each one
        // otherwise start off with an empty one
        if (this.oldCondition.data_filter.filters) {
            this.oldCondition.data_filter.filters.forEach(f => this.addFilter(f));
        } else {
            this.addFilter();
        }

        this.subscriptions.push(this.form.valueChanges.subscribe(changes => {
            // watch for changes from the form and merge the form data into the condition node
            _.merge(this.condition, changes);
        }));
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
}
