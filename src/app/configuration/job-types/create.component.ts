import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Message, MenuItem, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
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
    selector: 'app-job-types-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class JobTypesCreateComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    env = environment;
    mode: string;
    jsonMode: boolean;
    jsonModeBtnClass: string;
    jobTypeJson: string;
    jsonConfig: object;
    jsonConfigReadOnly: object;
    msgs: Message[] = [];
    msgSubscription: any;
    workspaces: SelectItem[];
    jobType: JobType;
    cleanJobType: JobType;
    createForm: FormGroup;
    validated: boolean;
    submitted: boolean;
    icons: any;
    items: MenuItem[];
    currentStepIdx: number;
    constructor(
        private messageService: MessageService,
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
                        this.mode = 'Create';
                        this.jobType = new JobType('untitled-job-type', '1.0', null, 'Untitled Job Type');
                    }

                    this.createForm = this.fb.group({
                        'json-editor': new FormControl(''),
                        'icon': new FormControl('')
                    });
                    this.items = [
                        {
                            label: 'Seed Image'
                        },
                        {
                            label: 'General Information'
                        },
                        {
                            label: 'Validate and Create',
                            disabled: this.createForm.valid
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
                    this.createForm.valueChanges.subscribe(() => {
                        this.validateForm();
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
    private validateForm() {
        // only enable 'Validate and Create' when the form is valid
        this.items[this.items.length - 1].disabled = !this.createForm.valid ||
            !this.jobType.manifest ||
            _.keys(this.jobType.manifest).length === 0;
    }

    ngOnInit() {
        this.msgSubscription = this.messageService.messageObserver.subscribe(() => {
            // ignore messages from service
            this.msgs = [];
        });
    }

    ngOnDestroy() {
        this.routerEvents.unsubscribe();
        this.routeParams.unsubscribe();
        this.msgSubscription.unsubscribe();
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
                if (this.jobType.manifest) {
                    if (_.keys(this.jobType.manifest).length === 0) {
                        this.jobType.manifest = null;
                    }
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
        this.jobType.manifest = seedImage;
        this.jobType.docker_image = `${seedImage.job.name}/${seedImage.job.jobVersion}`;
        this.validateForm();
        console.log(seedImage);
    }
    onImageRemove() {
        this.jobType.manifest = null;
        this.validateForm();
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
                this.msgs.push({severity: 'info', summary: 'Validation Successful', detail: 'Job Type is valid and can be created.'});
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
