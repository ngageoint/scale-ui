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
    @Input() conditions: RecipeTypeCondition[];
    @Output() save: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    private condition = RecipeTypeCondition.transformer(null);
    private subscriptions: Subscription[] = [];

    // main form that will be saved
    form = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z_-]+$/), this.existingConditionsValidator()]],
        data_filter: this.fb.group({
            filters: this.fb.array([
                this.getFilterForm()
            ], Validators.required),
            all: [true, Validators.required],
        })
    });

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
     * Get a new, blank group for a new filter.
     * @return the group with required fields for the filter
     */
    private getFilterForm(): FormGroup {
        return this.fb.group({
            name: ['', Validators.required],
            type: ['', Validators.required],
            condition: ['', Validators.required],
            values: this.fb.array([
                this.fb.control('', [Validators.required])
            ])
        });
    }

    /**
     * Helper to add a new filter form group and expand the accordion to that position.
     */
    addFilter(): void {
        this.filters.push(this.getFilterForm());
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

    saveClick(): void {
        this.save.next(this.condition);
        this.cancelClick();
    }

    cancelClick(): void {
        this.cancel.next(true);
    }

    ngOnInit() {
        if (this.form) {
            this.subscriptions.push(this.form.valueChanges.subscribe(changes => {
                _.merge(this.condition, changes);
            }));
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
}
