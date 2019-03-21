import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import * as beautify from 'js-beautify';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';

import { JobType } from './api.model';
import { JobTypesApiService } from './api.service';
import iconData from './font-awesome.json';
import { WorkspacesApiService } from '../../system/workspaces/api.service';

@Component({
    selector: 'dev-job-types-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class JobTypesCreateComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    env = environment;
    mode: string;
    formSubscription: any;
    jsonMode: boolean;
    jsonModeBtnClass: string;
    jobTypeJson: string;
    jsonConfig = {
        mode: {name: 'application/json', json: true},
        indentUnit: 4,
        lineNumbers: true,
        allowDropFileTypes: ['application/json'],
        viewportMargin: Infinity
    };
    jsonConfigReadOnly = {
        mode: {name: 'application/json', json: true},
        indentUnit: 4,
        lineNumbers: true,
        readOnly: 'nocursor',
        viewportMargin: Infinity
    };
    workspaces: SelectItem[] = [];
    jobType: any;
    cleanJobType: JobType;
    createForm: FormGroup = this.fb.group({
        'json-editor': new FormControl(''),
        'icon': new FormControl('')
    });
    validated: boolean;
    submitted: boolean;
    iconData = iconData;
    icons: SelectItem[] = [];
    items: MenuItem[];
    currentStepIdx: number;
    modifiedJobTypeId: number;

    constructor(
        private messageService: MessageService,
        private jobTypesApiService: JobTypesApiService,
        private workspacesApiService: WorkspacesApiService,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    private stripObject(obj: object) {
        const strippedObj: any = _.cloneDeep(obj);
        _.pickBy(obj, (value: any, key: any): any => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const childObj = this.stripObject(value);
                if (_.keys(childObj).length > 0) {
                    strippedObj[key] = childObj;
                } else {
                    delete strippedObj[key];
                }
            } else {
                if (value !== null && typeof value !== 'undefined' && value !== '' && !Array.isArray(value)) {
                    strippedObj[key] = value;
                } else if (Array.isArray(value) && value.length > 0) {
                    strippedObj[key] = value;
                } else {
                    delete strippedObj[key];
                }
            }
        });
        return strippedObj;
    }

    private validateForm() {
        // only enable 'Validate and Create' when the form is valid
        this.items[this.items.length - 1].disabled = !this.createForm.valid ||
            !this.jobType.manifest ||
            _.keys(this.jobType.manifest).length === 0;
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    onModeClick() {
        this.jsonMode = !this.jsonMode;
        if (this.jsonMode) {
            this.jsonModeBtnClass = 'ui-button-primary';
            this.jobTypeJson = beautify(JSON.stringify(this.jobType));
        } else {
            this.jsonModeBtnClass = 'ui-button-secondary';
            try {
                this.jobType = JSON.parse(this.jobTypeJson);
                if (this.jobType.manifest) {
                    if (_.keys(this.jobType.manifest).length === 0) {
                        this.jobType.manifest = null;
                    }
                }
            } catch (error) {
                this.messageService.add({ severity: 'error', summary: 'Error:', detail: error.message });
                this.jsonMode = true;
                this.jsonModeBtnClass = 'ui-button-primary';
            }
        }
    }

    handleStepChange(index) {
        this.currentStepIdx = index;
    }

    onImageImport(seedImage) {
        // just grab the first job version and image for now
        const image = seedImage.job.JobVersions[0].Images[0];
        this.jobType.manifest = seedImage.manifest;
        this.jobType.docker_image = `${image.Registry}/${image.Org}/${image.Name}`;
        this.validateForm();
        console.log(this.jobType);
    }

    onImageRemove() {
        this.jobType.manifest = null;
        this.validateForm();
    }

    onValidate() {
        // remove falsey values
        this.cleanJobType = this.stripObject(this.jobType);

        // this.cleanJobType['interface'] = this.cleanJobType.job_type_interface;
        // delete this.cleanJobType.job_type_interface;

        // perform validation
        this.jobTypesApiService.validateJobType(this.cleanJobType).subscribe(result => {
            if (result.warnings.length > 0) {
                this.validated = false;
                _.forEach(result.warnings, (warning) => {
                    this.messageService.add({ severity: 'error', summary: warning.id, detail: warning.details });
                });
            } else {
                this.validated = true;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Validation Successful',
                    detail: 'Job Type is valid and can be created.'
                });
            }
        });
    }

    selectIcon() {
        this.jobType.icon_code = this.createForm.get('icon').value;
    }

    onSubmit() {
        this.submitted = true;
        if (this.mode === 'Create') {
            this.jobTypesApiService.createJobType(this.cleanJobType).subscribe(result => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `${this.mode} Successful` });
                this.modifiedJobTypeId = result.id;
                _.forEach(this.items, item => {
                    item.disabled = true;
                });
            }, err => {
                console.log(err);
                this.modifiedJobTypeId = null;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.statusText });
            });
        } else {
            this.jobTypesApiService.updateJobType(this.cleanJobType).subscribe(result => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `${this.mode} Successful` });
                this.modifiedJobTypeId = result.id;
                _.forEach(this.items, item => {
                    item.disabled = true;
                });
            }, err => {
                console.log(err);
                this.modifiedJobTypeId = null;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.statusText });
            });
        }
    }

    ngOnInit() {
        this.items = [
            {
                label: 'Seed Image'
            },
            {
                label: 'General Information'
            },
            {
                label: 'Validate and Create',
                disabled: this.createForm.valid && this.mode === 'Create'
            }
        ];

        _.forEach(this.iconData, d => {
            this.icons.push({
                label: d.label,
                value: d.value
            });
        });

        this.jsonModeBtnClass = 'ui-button-secondary';
        this.currentStepIdx = 0;
        this.formSubscription = this.createForm.valueChanges.subscribe(() => {
            this.validateForm();
        });

        let name = null;
        let version = null;
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(params => {
                name = params.get('name');
                version = params.get('version');

                if (name && version) {
                    this.mode = 'Edit';
                    this.jobTypesApiService.getJobType(name, version).subscribe(data => {
                        this.jobType = data;
                    });
                } else {
                    this.mode = 'Create';
                    this.jobType = JobType.transformer(null);
                }
            });
        }
    }

    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }

        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
    }
}
