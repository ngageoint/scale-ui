import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';

import { RecipeTypeInputInterface } from './api.input-interface.model';
import { RecipeTypeInputInterfaceJson } from './api.input-interface.json.model';

@Component({
    selector: 'dev-recipe-type-json',
    templateUrl: './json.component.html',
    styleUrls: ['./json.component.scss']
})
export class RecipeTypeJsonComponent implements OnInit, OnDestroy {
    @Input() input: RecipeTypeInputInterface;
    @Output() inputChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() createForm: any;
    @Output() createFormChange: EventEmitter<any> = new EventEmitter<any>();
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
        const control: any = this.createForm.get('definition.input.json');
        control.push(new FormControl(addedJson));
        this.inputChange.emit();
        this.createFormChange.emit();
        this.jsonForm.reset();
    }

    onRemoveJsonClick(json) {
        const removedJson = this.input.removeJson(json);
        const control: any = this.createForm.get('definition.input.json');
        const idx = _.findIndex(control.value, removedJson);
        if (idx >= 0) {
            control.removeAt(idx);
        }
        this.inputChange.emit();
        this.createFormChange.emit();
    }

    ngOnInit() {
        if (this.jsonForm) {
            // listen to changes to jsonForm fields
            this.jsonFormSubscription = this.jsonForm.valueChanges.subscribe(changes => {
                this.json = RecipeTypeInputInterfaceJson.transformer(changes);
            });
        }
    }

    ngOnDestroy() {
        this.unsubscribeFromForm();
    }
}
