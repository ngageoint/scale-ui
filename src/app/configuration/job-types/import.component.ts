import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Message, MenuItem } from 'primeng/primeng';
import * as beautify from 'js-beautify';

import { JobType } from './api.model';
import { JobTypesApiService } from './api.service';
import * as iconData from './font-awesome.json';

@Component({
    selector: 'app-job-types-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss']
})
export class JobTypesImportComponent implements OnInit {
    jsonMode: boolean;
    jsonModeBtnClass: string;
    jobTypeJson: string;
    jsonConfig: object;
    msgs: Message[] = [];
    jobType: JobType;
    importForm: FormGroup;
    submitted: boolean;
    icons: any;
    items: MenuItem[];
    currentStepIdx: number;
    constructor(
        // private jobTypesApiService: JobTypesApiService,
        private fb: FormBuilder
    ) {
        this.jobType = new JobType('untitled-algorithm', '1.0', {}, 'Untitled Algorithm');
        this.jsonConfig = {
            mode: {name: 'application/json', json: true},
            indentUnit: 4,
            lineNumbers: true,
            allowDropFileTypes: ['application/json'],
            viewportMargin: Infinity
        };
        this.icons = iconData;
    }
    ngOnInit() {
        this.importForm = this.fb.group({
            'json': new FormControl(''),
            'json-editor': new FormControl(''),
            'name': new FormControl('', Validators.required),
            'title': new FormControl(''),
            'version': new FormControl('', Validators.required),
            'description': new FormControl(''),
            'author-name': new FormControl(''),
            'author-url': new FormControl(''),
            'icon': new FormControl(''),
            'docker-image': new FormControl(''),
            'timeout': new FormControl(''),
            'max-tries': new FormControl(''),
            'cpus': new FormControl(''),
            'memory': new FormControl('')
        });
        this.items = [
            { label: 'General Information' },
            { label: 'Algorithm Interface' },
            { label: 'Validate and Import' }
        ];
        this.jsonModeBtnClass = 'ui-button-secondary';
        this.currentStepIdx = 0;
    }
    onModeClick() {
        this.jsonMode = !this.jsonMode;
        if (this.jsonMode) {
            this.jsonModeBtnClass = 'ui-button-primary';
            this.jobTypeJson = beautify(JSON.stringify(this.jobType));
        } else {
            this.jsonModeBtnClass = 'ui-button-secondary';
            this.msgs = [];
            try {
                this.jobType = JSON.parse(this.jobTypeJson);
            } catch (error) {
                this.msgs.push({severity: 'error', summary: 'Error:', detail: error.message});
                this.jsonMode = true;
                this.jsonModeBtnClass = 'ui-button-primary';
            }
        }
    }
    handleStepChange(index) {
        this.currentStepIdx = index;
    }
    onSubmit(value: string) {
        this.submitted = true;
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Success', detail: 'Form Submitted'});
    }
    get diagnostic() { return JSON.stringify(this.importForm.value); }
}
