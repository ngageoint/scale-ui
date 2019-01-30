import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { RecipeTypeFilter } from './api.filter.model';

@Component({
    selector: 'dev-recipe-type-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class RecipeTypeFilterComponent implements OnInit, OnDestroy {
    @Input() condition: any;
    @Output() conditionChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() conditionForm: any;
    @Output() conditionFormChange: EventEmitter<any> = new EventEmitter<any>();
    filter: RecipeTypeFilter;
    filterFormSubscription: any;
    filterForm = this.fb.group({
        name: ['', Validators.required],
        type: ['', Validators.required],
        condition: ['', Validators.required],
        values: [''],
        fields: [''],
        all_fields: [true],
        all_files: [false]
    });
    typeOptions: SelectItem[] = [
        { label: 'Array', value: 'array' },
        { label: 'Boolean', value: 'boolean' },
        { label: 'Integer', value: 'integer' },
        { label: 'Number', value: 'number' },
        { label: 'Object', value: 'object' },
        { label: 'String', value: 'string' },
        { label: 'Filename', value: 'filename' },
        { label: 'Media Type', value: 'media-type' },
        { label: 'Data Type', value: 'data-type' },
        { label: 'Metadata', value: 'meta-data' }
    ];
    conditionOptions: SelectItem[] = [
        { label: '<', value: '<' },
        { label: '<=', value: '<=' },
        { label: '>', value: '>' },
        { label: '>=', value: '>=' },
        { label: '==', value: '==' },
        { label: '!=', value: '!=' },
        { label: 'between', value: 'between' },
        { label: 'in', value: 'in' },
        { label: 'not in', value: 'not in' },
        { label: 'contains', value: 'contains' },
        { label: 'subset of', value: 'subset of' },
        { label: 'superset of', value: 'superset of' }
    ];

    constructor(
        private fb: FormBuilder
    ) {}

    private unsubscribeFromForm() {
        if (this.filterFormSubscription) {
            this.filterFormSubscription.unsubscribe();
        }
    }

    onAddFilterClick() {
        const addedFilter = this.condition.filterInterface.addFilter(this.filter);
        const control: any = this.conditionForm.get('data_filter.filters');
        control.push(new FormControl(addedFilter));
        this.conditionChange.emit();
        this.conditionFormChange.emit();
        this.filterForm.reset();
    }

    onRemoveFilterClick(filter) {
        const removedFilter = this.condition.filterInterface.removeFilter(filter);
        const control: any = this.conditionForm.get('data_filter.filters');
        const idx = _.findIndex(control.value, removedFilter);
        if (idx >= 0) {
            control.removeAt(idx);
        }
        this.conditionChange.emit();
        this.conditionFormChange.emit();
    }

    onToggleClick(e) {
        e.originalEvent.preventDefault();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.unsubscribeFromForm();
    }
}
