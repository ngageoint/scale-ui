import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

import { RecipeTypeFilter } from './api.filter.model';

enum FilterCondition {
    LessThan = '<',
    LessThanEqualTo = '<=',
    GreaterThan = '>',
    GreaterThanEqualTo = '>=',
    Equals = '==',
    NotEquals = '!=',
    Between = 'between',
    In = 'in',
    NotIn = 'not in',
    Contains = 'contains',
    Subset = 'subset of',
    Superset = 'superset of',
}
enum FilterType {
    String = 'string',
    Filename = 'filename',
    MediaType = 'media-type',
    DataType = 'data-type',
    Integer = 'integer',
    Number = 'number',
    Boolean = 'boolean',
    MetaData = 'meta-data',
    Object = 'object',
}


@Component({
    selector: 'dev-recipe-type-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class RecipeTypeFilterComponent implements OnInit, OnDestroy {
    @Input() form: FormGroup;
    @Output() formChange: EventEmitter<any> = new EventEmitter<any>();
    private filter = RecipeTypeFilter.transformer(null);
    private subscriptions: Subscription[] = [];

    /*
     * TODO
     * - object/metadata
     * - ensure num values stays in sync
     */

    // alias the enums into template
    public FilterCondition = FilterCondition;
    public FilterType = FilterType;

    // dropdown options for type field
    typeOptions: SelectItem[] = [
        { label: 'String', value: FilterType.String },
        { label: 'Filename', value: FilterType.Filename },
        { label: 'Media type', value: FilterType.MediaType },
        { label: 'Data type', value: FilterType.DataType },
        { label: 'Number', value: FilterType.Number },
        { label: 'Integer', value: FilterType.Integer },
        { label: 'Boolean', value: FilterType.Boolean },
        // { label: 'Object', value: FilterType.Object },
        // { label: 'Metadata', value: FilterType.MetaData },
    ];

    // keep track of conditions having multiple input values
    private conditionsWithMultipleInputs: Set<FilterCondition> = new Set([
        FilterCondition.In,
        FilterCondition.NotIn,
        FilterCondition.Contains
    ]);
    // conditions with only two inputs
    private conditionsWithTwoInputs: Set<FilterCondition> = new Set([
        FilterCondition.Between
    ]);

    // used to show string inputs fields
    private stringTypes: Set<FilterType> = new Set([
        FilterType.String,
        FilterType.Filename,
        FilterType.MediaType,
        FilterType.DataType,
    ]);
    // conditions available for string types
    private stringConditions: Set<FilterCondition> = new Set([
        FilterCondition.Equals,
        FilterCondition.NotEquals,
        FilterCondition.In,
        FilterCondition.NotIn,
        FilterCondition.Contains,
    ]);
    public stringConditionsOptions: SelectItem[];

    // used to show number inputs fields
    private numberTypes: Set<FilterType> = new Set([
        FilterType.Integer,
        FilterType.Number,
    ]);
    // conditions available for number types
    private numberConditions: Set<FilterCondition> = new Set([
        FilterCondition.LessThan,
        FilterCondition.LessThanEqualTo,
        FilterCondition.Equals,
        FilterCondition.NotEquals,
        FilterCondition.GreaterThan,
        FilterCondition.GreaterThanEqualTo,
        FilterCondition.Between,
        FilterCondition.In,
        FilterCondition.NotIn,
    ]);
    public numberConditionsOptions: SelectItem[];

    // used to show switch inputs
    private booleanTypes: Set<FilterType> = new Set([
        FilterType.Boolean
    ]);
    // conditions available for booleans
    private booleanConditions: Set<FilterCondition> = new Set([
        FilterCondition.Equals,
        FilterCondition.NotEquals,
    ]);
    public booleanConditionsOptions: SelectItem[];

    // used to show fields for objects
    private objectTypes: Set<FilterType> = new Set([
        FilterType.MetaData,
        FilterType.Object
    ]);
    // conditions availabe for object types
    private objectConditions: Set<FilterCondition> = new Set([
        FilterCondition.LessThan,
        FilterCondition.LessThanEqualTo,
        FilterCondition.Equals,
        FilterCondition.NotEquals,
        FilterCondition.GreaterThan,
        FilterCondition.GreaterThanEqualTo,
        FilterCondition.Between,
        FilterCondition.In,
        FilterCondition.NotIn,
        FilterCondition.Contains,
        FilterCondition.Subset,
        FilterCondition.Superset
    ]);
    public objectConditionsOptions: SelectItem[];

    /** Get the values array from the form */
    get values(): FormArray {
        return this.form.get('values') as FormArray;
    }

    /** Get the condition options, dependant on the type field */
    get conditionOptions(): SelectItem[] {
        const type = this.form.get('type').value;

        if (this.stringTypes.has(type)) {
            return this.stringConditionsOptions;
        } else if (this.numberTypes.has(type)) {
            return this.numberConditionsOptions;
        } else if (this.booleanTypes.has(type)) {
            return this.booleanConditionsOptions;
        } else if (this.objectTypes.has(type)) {
            return this.objectConditionsOptions;
        }
        return [];
    }

    /** Get the number of values that should be shown based on the condition field, -1 for unlimited */
    get numValues(): number {
        const condition = this.form.get('condition').value;

        if (this.conditionsWithTwoInputs.has(condition)) {
            return 2;
        } else if (!this.conditionsWithMultipleInputs.has(condition)) {
            return 1;
        }
        return -1;
    }

    /** Determine whether or not the text/string input should be used */
    get showTextField(): boolean {
        return this.stringTypes.has(this.form.get('type').value);
    }

    /** Determine whether or not the number input should be used */
    get showNumberField(): boolean {
        return this.numberTypes.has(this.form.get('type').value);
    }

    /** Determine whether or not the switch should be used */
    get showBooleanField(): boolean {
        return this.booleanTypes.has(this.form.get('type').value);
    }


    constructor(
        private fb: FormBuilder
    ) {
        // build SelectItem[] for the condition options based on the values in the set
        this.stringConditionsOptions = Array.from(this.stringConditions.values()).map(t => ({ label: t, value: t }));
        this.numberConditionsOptions = Array.from(this.numberConditions.values()).map(t => ({ label: t, value: t }));
        this.booleanConditionsOptions = Array.from(this.booleanConditions.values()).map(t => ({ label: t, value: t }));
        this.objectConditionsOptions = Array.from(this.objectConditions.values()).map(t => ({ label: t, value: t }));
    }

    /**
     * Helper for adding a value input field.
     */
    addValue(): void {
        this.values.push(
            this.fb.control('', [Validators.required])
        );
    }

    /**
     * Removes a value input field at the given position.
     * @param idx index position of the field to remove
     */
    removeValue(idx: number): void {
        this.values.removeAt(idx);
    }



    ngOnInit() {
        if (this.form) {
            this.subscriptions.push(this.form.valueChanges.subscribe(changes => {
                _.merge(this.filter, changes);
            }));

            this.subscriptions.push(this.form.get('condition').valueChanges.subscribe(condition => {
                const size = this.numValues;

                // ensure there are enough value fields
                if (size !== -1 && this.values.length < size) {
                    for (let i = this.values.length; i < size; i++) {
                        this.addValue();
                    }
                }
                // ensure there aren't too many value fields
                if (size !== -1 && this.values.length > size) {
                    for (let i = this.values.length; i >= size; i--) {
                        this.values.removeAt(i);
                    }
                }
            }));
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
}
