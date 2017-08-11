import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Message, SelectItem } from 'primeng/primeng';

import { JobType } from './api.model';
import { JobTypesApiService } from './api.service';

@Component({
    selector: 'app-job-types-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss']
})
export class JobTypesImportComponent implements OnInit {
    msgs: Message[] = [];
    jobType: JobType;
    importForm: FormGroup;
    submitted: boolean;
    icons: SelectItem[];
    selectedIcon: SelectItem;
    constructor(
        private jobTypesApiService: JobTypesApiService,
        private fb: FormBuilder
    ) {
        this.jobType = new JobType('untitled-algorithm', '1.0', {}, 'Untitled Algorithm');
    }
    ngOnInit() {
        this.importForm = this.fb.group({
            'name': new FormControl('', Validators.required),
            'title': new FormControl(''),
            'version': new FormControl('', Validators.required),
            'description': new FormControl(''),
            'author-name': new FormControl(''),
            'author-url': new FormControl(''),
            'icon': new FormControl('')
        });
        this.jobTypesApiService.getIcons().then(icons => this.icons = icons);
    }
    onSubmit(value: string) {
        this.submitted = true;
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Success', detail: 'Form Submitted'});
    }
    get diagnostic() { return JSON.stringify(this.importForm.value); }
}
