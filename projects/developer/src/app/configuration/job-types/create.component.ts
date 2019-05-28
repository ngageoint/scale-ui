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
import { iconData } from './font-awesome.json';
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
    cleanJobType: any;
    createForm: FormGroup = this.fb.group({
        'icon': new FormControl('')
    });
    validated: boolean;
    submitted: boolean;
    iconData = iconData;
    icons: SelectItem[] = [];
    items: MenuItem[];
    currentStepIdx: number;
    modifiedJobTypeName: string;
    modifiedJobTypeVersion: string;

    constructor(
        private messageService: MessageService,
        private jobTypesApiService: JobTypesApiService,
        private workspacesApiService: WorkspacesApiService,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute
    ) {}

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

        // use manifest data to stub out a configuration
        let mounts = null;
        if (this.jobType.manifest.job.interface.mounts) {
            mounts = {};
            _.forEach(this.jobType.manifest.job.interface.mounts, mount => {
                mounts[mount.name] = {};
            });
        }

        let outputWorkspaces = null;
        if (this.jobType.manifest.job.interface.outputs.files) {
            outputWorkspaces = {
                default: '',
                outputs: {}
            };
            _.forEach(this.jobType.manifest.job.interface.outputs.files, file => {
                outputWorkspaces.outputs[file.name] = '';
            });
        }

        let settings = null;
        if (this.jobType.manifest.job.interface.settings) {
            settings = {};
            _.forEach(this.jobType.manifest.job.interface.settings, setting => {
                settings[setting.name] = '';
            });
        }

        this.jobType.configuration = {
            mounts: mounts,
            output_workspaces: outputWorkspaces,
            priority: 100,
            settings: settings
        };

        this.jobType.configuration = _.pickBy(this.jobType.configuration, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });

        this.validateForm();
        console.log(this.jobType);
    }

    onImageRemove() {
        this.jobType.configuration = null;
        this.jobType.manifest = null;
        delete this.jobType.docker_image;
        this.validated = false;
        this.validateForm();
    }

    onValidate() {
        // remove falsey values
        this.cleanJobType = JobType.cleanJobType(this.jobType);

        // perform validation
        this.jobTypesApiService.validateJobType(this.cleanJobType).subscribe(result => {
            if (!result.is_valid) {
                this.validated = false;
                _.forEach(result.warnings, warning => {
                    this.messageService.add({ severity: 'warning', summary: warning.name, detail: warning.description, sticky: true });
                });
                _.forEach(result.errors, error => {
                    this.messageService.add({ severity: 'error', summary: error.name, detail: error.description, sticky: true });
                });
            } else {
                this.validated = true;
                this.messageService.add({
                    severity: 'info',
                    summary: 'Validation Successful',
                    detail: 'Job Type is valid and can be created.'
                });
            }
        }, err => {
            console.log(err);
            this.messageService.add({ severity: 'error', summary: 'Error validating job type', detail: err.statusText });
        });
    }

    selectIcon() {
        this.jobType.icon_code = this.createForm.get('icon').value;
    }

    onSubmit() {
        this.submitted = true;
        if (this.mode === 'Create') {
            this.jobTypesApiService.createJobType(this.jobType).subscribe(result => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `${this.mode} Successful` });
                this.modifiedJobTypeName = result.name;
                this.modifiedJobTypeVersion = result.version;
                _.forEach(this.items, item => {
                    item.disabled = true;
                });
            }, err => {
                console.log(err);
                this.submitted = false;
                this.modifiedJobTypeName = null;
                this.modifiedJobTypeVersion = null;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.statusText });
            });
        } else {
            this.jobTypesApiService.updateJobType(this.jobType).subscribe(result => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `${this.mode} Successful` });
                this.modifiedJobTypeName = result.name;
                this.modifiedJobTypeVersion = result.version;
                _.forEach(this.items, item => {
                    item.disabled = true;
                });
            }, err => {
                console.log(err);
                this.submitted = false;
                this.modifiedJobTypeName = null;
                this.modifiedJobTypeVersion = null;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.statusText });
            });
        }
    }

    ngOnInit() {
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
