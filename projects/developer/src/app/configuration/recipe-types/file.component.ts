import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';

import { RecipeTypeInput } from './api.input.model';
import { RecipeTypeInputFile } from './api.input.file.model';

@Component({
    selector: 'dev-recipe-type-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss']
})
export class RecipeTypeFileComponent implements OnInit, OnDestroy {
    @Input() input: RecipeTypeInput;
    @Output() inputChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() form: any;
    @Output() formChange: EventEmitter<any> = new EventEmitter<any>();
    @Input() filesControl: string;
    file: any;
    fileFormSubscription: any;
    fileForm = this.fb.group({
        name: ['', Validators.required],
        required: [true],
        media_types: [''],
        multiple: [false]
    });

    constructor(
        private fb: FormBuilder
    ) {
    }

    private unsubscribeFromForm() {
        if (this.fileFormSubscription) {
            this.fileFormSubscription.unsubscribe();
        }
    }

    onToggleClick(e) {
        e.originalEvent.preventDefault();
    }

    onAddFileClick() {
        const addedFile = this.input.addFile(this.file);
        const control: any = this.form.get(this.filesControl);
        control.push(new FormControl(addedFile));
        this.inputChange.emit();
        this.formChange.emit();
        this.fileForm.reset();
    }

    onRemoveFileClick(file) {
        const removedFile = this.input.removeFile(file);
        const control: any = this.form.get(this.filesControl);
        const idx = _.findIndex(control.value, removedFile);
        if (idx >= 0) {
            control.removeAt(idx);
        }
        this.inputChange.emit();
        this.formChange.emit();
    }

    ngOnInit() {
        if (this.fileForm) {
            // listen to changes to fileForm fields
            this.fileFormSubscription = this.fileForm.valueChanges.subscribe(changes => {
                this.file = RecipeTypeInputFile.transformer(changes);
            });
        }
    }

    ngOnDestroy() {
        this.unsubscribeFromForm();
    }
}
