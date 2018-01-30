import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Message, MenuItem, SelectItem } from 'primeng/primeng';
import * as beautify from 'js-beautify';
import * as _ from 'lodash';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { environment } from '../../../environments/environment';

import { JobType } from './api.model';
import { JobTypesApiService } from './api.service';
import * as iconData from './font-awesome.json';
import { Trigger, TriggerConfiguration, TriggerData } from './trigger.model';
import { WorkspacesApiService } from '../workspaces/api.service';
import { CustomResources } from './custom.resources.model';

@Component({
    selector: 'app-job-types-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss']
})
export class JobTypesImportComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    env = environment;
    mode: string;
    jsonMode: boolean;
    jsonModeBtnClass: string;
    jobTypeJson: string;
    manifestJson: string;
    jsonConfig: object;
    jsonConfigReadOnly: object;
    msgs: Message[] = [];
    workspaces: SelectItem[];
    jobType: JobType;
    cleanJobType: JobType;
    importForm: FormGroup;
    validated: boolean;
    submitted: boolean;
    icons: any;
    items: MenuItem[];
    currentStepIdx: number;
    triggerForm: FormGroup;
    trigger: Trigger;
    triggerJson: string;
    triggerTypeOptions: SelectItem[];
    errorMappingForm: FormGroup;
    errorMappingExitCode: any;
    errorMappingJson: string;
    customResourcesForm: FormGroup;
    customResources: any;
    customResourcesJson: string;
    constructor(
        private jobTypesApiService: JobTypesApiService,
        private workspacesApiService: WorkspacesApiService,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute
    ) {
        if (this.router.events) {
            this.routerEvents = this.router.events
                .filter((event) => event instanceof NavigationEnd)
                .map(() => this.route)
                .subscribe(() => {
                    let id = null;
                    if (this.route && this.route.paramMap) {
                        this.routeParams = this.route.paramMap.subscribe(params => {
                            id = +params.get('id');
                        });
                    }
                    if (id > 0) {
                        this.mode = 'Edit';
                        this.jobTypesApiService.getJobType(id).then(data => {
                            this.jobType = data;
                        });
                    } else {
                        this.mode = 'Import';
                        this.jobType = new JobType('untitled-algorithm', '1.0', null, 'Untitled Algorithm');
                    }
                    this.getWorkspaces();

                    this.importForm = this.fb.group({
                        'json-editor': new FormControl(''),
                        'name': new FormControl({value: '', disabled: this.mode === 'Edit'}, Validators.required),
                        'title': new FormControl(''),
                        'version': new FormControl('', Validators.required),
                        'description': new FormControl(''),
                        'author_name': new FormControl(''),
                        'author_url': new FormControl(''),
                        'icon': new FormControl(''),
                        'docker_image': new FormControl(''),
                        'timeout': new FormControl(''),
                        'max_tries': new FormControl(''),
                        'cpus': new FormControl(''),
                        'memory': new FormControl(''),
                        'error-mapping-version': new FormControl(''),
                        'custom-resources-version': new FormControl('')
                    });
                    this.triggerForm = this.fb.group({
                        'type': new FormControl('', Validators.required),
                        'is_active': new FormControl(''),
                        'version': new FormControl(''),
                        'media_type': new FormControl(''),
                        'data_types': new FormControl(''),
                        'input_data_name': new FormControl('', Validators.required),
                        'workspace_name': new FormControl('', Validators.required),
                        'json-editor': new FormControl('')
                    });
                    this.errorMappingForm = this.fb.group({
                        'key': new FormControl('', Validators.required),
                        'value': new FormControl('', Validators.required),
                        'json-editor': new FormControl('')
                    });
                    this.customResourcesForm = this.fb.group({
                        'key': new FormControl('', Validators.required),
                        'value': new FormControl('', Validators.required),
                        'json-editor': new FormControl('')
                    });
                    this.items = [
                        {
                            label: 'General Information'
                        },
                        {
                            label: 'Seed Image'
                        },
                        {
                            label: 'Trigger'
                        },
                        {
                            label: 'Error Mapping'
                        },
                        {
                            label: 'Custom Resources'
                        },
                        {
                            label: 'Validate and Import',
                            disabled: this.importForm.valid
                        }
                    ];
                    this.workspaces = [];
                    this.jsonConfig = {
                        mode: {name: 'application/json', json: true},
                        indentUnit: 4,
                        lineNumbers: true,
                        allowDropFileTypes: ['application/json'],
                        viewportMargin: Infinity
                    };
                    this.jsonConfigReadOnly = {
                        mode: {name: 'application/json', json: true},
                        indentUnit: 4,
                        lineNumbers: true,
                        readOnly: 'nocursor',
                        viewportMargin: Infinity
                    };
                    this.icons = iconData;
                    this.jsonModeBtnClass = 'ui-button-secondary';
                    this.currentStepIdx = 0;
                    this.trigger = new Trigger('', new TriggerConfiguration(new TriggerData('', '')));
                    this.triggerTypeOptions = [
                        {
                            label: 'Parse',
                            value: 'PARSE'
                        },
                        {
                            label: 'Ingest',
                            value: 'INGEST'
                        }
                    ];
                    this.errorMappingExitCode = {};
                    this.customResources = new CustomResources();
                    this.importForm.valueChanges.subscribe(() => {
                        // only enable 'Validate and Import' when the form is valid
                        this.items[this.items.length - 1].disabled = !this.importForm.valid || !this.jobType.manifest;
                    });
                });
        }
    }
    private stripObject(obj: object) {
        const strippedObj = _.cloneDeep(obj);
        _.pickBy(obj, (value, key) => {
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
    private getWorkspaces() {
        this.workspacesApiService.getWorkspaces().then(data => {
            _.forEach(data.results, (workspace) => {
                this.workspaces.push({
                    label: workspace.title,
                    value: workspace.name
                });
            });
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.routerEvents.unsubscribe();
        this.routeParams.unsubscribe();
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
            this.msgs = [];
            try {
                this.jobType = JSON.parse(this.jobTypeJson);
                if (this.jobType.trigger_rule) {
                    this.triggerJson = beautify(JSON.stringify(this.jobType.trigger_rule));
                }
                if (this.jobType.error_mapping) {
                    this.errorMappingJson = beautify(JSON.stringify(this.jobType.error_mapping.exit_codes));
                }
                if (this.jobType.custom_resources) {
                    this.customResourcesJson = beautify(JSON.stringify(this.jobType.custom_resources.resources));
                }
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
    onImageImport(seedImage) {
        this.manifestJson = beautify(JSON.stringify(seedImage));
        this.jobType.manifest = seedImage;
    }
    onImageRemove() {
        this.manifestJson = null;
        this.jobType.manifest = null;
        // only enable 'Validate and Import' when the form is valid
        this.items[this.items.length - 1].disabled = !this.importForm.valid || !this.jobType.manifest;
    }
    onTriggerFormSubmit() {
        this.jobType.trigger_rule = this.stripObject(this.trigger);
        this.triggerJson = beautify(JSON.stringify(this.jobType.trigger_rule));
    }
    onErrorMappingFormSubmit() {
        this.jobType.error_mapping.exit_codes[this.errorMappingExitCode.key] = this.errorMappingExitCode.value;
        this.jobType.error_mapping.exit_codes = this.stripObject(this.jobType.error_mapping.exit_codes);
        this.errorMappingJson = beautify(JSON.stringify(this.jobType.error_mapping.exit_codes));
        this.errorMappingForm.reset();
    }
    onTriggerDelete() {
        this.triggerForm.reset();
        this.jobType.trigger_rule = null;
    }
    onCustomResourcesFormSubmit() {
        this.jobType.custom_resources.resources[this.customResources.key] = this.customResources.value;
        this.jobType.custom_resources.resources = this.stripObject(this.jobType.custom_resources.resources);
        this.customResourcesJson = beautify(JSON.stringify(this.jobType.custom_resources.resources));
        this.customResourcesForm.reset();
    }
    onValidate() {
        this.msgs = [];

        // remove falsey values
        this.cleanJobType = this.stripObject(this.jobType);

        // this.cleanJobType['interface'] = this.cleanJobType.job_type_interface;
        // delete this.cleanJobType.job_type_interface;

        // perform validation
        this.jobTypesApiService.validateJobType(this.cleanJobType).then(result => {
            if (result.warnings.length > 0) {
                this.validated = false;
                _.forEach(result.warnings, (warning) => {
                    this.msgs.push({severity: 'error', summary: warning.id, detail: warning.details});
                });
            } else {
                this.validated = true;
                this.msgs.push({severity: 'info', summary: 'Validation Successful', detail: 'Algorithm is valid and ready for import.'});
            }
        });
    }
    onSubmit() {
        this.submitted = true;
        this.msgs = [];
        this.msgs.push({severity: 'success', summary: 'Success', detail: 'Form Submitted'});
        _.forEach(this.items, (item) => {
            item.disabled = true;
        });
    }
    get diagnostic() { return JSON.stringify(this.cleanJobType); }
}
