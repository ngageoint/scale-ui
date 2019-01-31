import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';

import { RecipeTypeInput } from './api.input.model';
import { RecipeTypeInputJson } from './api.input.json.model';

@Component({
    selector: 'dev-recipe-type-json',
    templateUrl: './json.component.html',
    styleUrls: ['./json.component.scss']
})
export class RecipeTypeJsonComponent implements OnInit, OnDestroy {
    @Input() input: RecipeTypeInput;
    @Output() inputChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() form: any;
    @Output() formChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() jsonControl: string;
    json: any;
    jsonFormSubscription: any;
    jsonForm = this.fb.group({
        name: ['', Validators.required],
        required: [true],
        type: ['', Validators.required]
    });

    constructor(
        private fb: FormBuilder
    ) {
    }

    private unsubscribeFromForm() {
        if (this.jsonFormSubscription) {
            this.jsonFormSubscription.unsubscribe();
        }
    }

    onToggleClick(e) {
        e.originalEvent.preventDefault();
    }

    onAddJsonClick() {
        const addedJson = this.input.addJson(this.json);
        const control: any = this.form.get(this.jsonControl);
        control.push(new FormControl(addedJson));
        this.inputChange.emit();
        this.formChange.emit();
        this.jsonForm.reset();
    }

    onRemoveJsonClick(json) {
        const removedJson = this.input.removeJson(json);
        const control: any = this.form.get(this.jsonControl);
        const idx = _.findIndex(control.value, removedJson);
        if (idx >= 0) {
            control.removeAt(idx);
        }
        this.inputChange.emit();
        this.formChange.emit();
    }

    ngOnInit() {
        if (this.jsonForm) {
            // listen to changes to jsonForm fields
            this.jsonFormSubscription = this.jsonForm.valueChanges.subscribe(changes => {
                this.json = RecipeTypeInputJson.transformer(changes);
            });
        }
    }

    ngOnDestroy() {
        this.unsubscribeFromForm();
    }
}
