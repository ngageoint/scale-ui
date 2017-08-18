import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Message, MenuItem, SelectItem } from 'primeng/primeng';
import * as beautify from 'js-beautify';
import * as _ from 'lodash';

import { JobType } from './api.model';
import { JobTypesApiService } from './api.service';
import * as iconData from './font-awesome.json';
import { InterfaceEnvVar, InterfaceInput, InterfaceMount, InterfaceOutput, InterfaceSetting, JobTypeInterface } from './interface.model';
import { Trigger, TriggerConfiguration, TriggerData } from './trigger.model';
import { ErrorMapping } from './error.mapping.model';
import { WorkspacesApiService } from '../workspaces/api.service';
import { Workspace } from '../workspaces/api.model';

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
    jsonConfigReadOnly: object;
    msgs: Message[] = [];
    workspaces: SelectItem[];
    jobType: JobType;
    importForm: FormGroup;
    validated: boolean;
    submitted: boolean;
    icons: any;
    items: MenuItem[];
    currentStepIdx: number;
    activeGeneralIndex: number[];
    activeInterfaceIndex: number[];
    triggerForm: FormGroup;
    trigger: Trigger;
    triggerJson: string;
    triggerTypeOptions: SelectItem[];
    errorMappingForm: FormGroup;
    errorMapping: ErrorMapping;
    errorMappingJson: string;
    interfaceEnvVarsForm: FormGroup;
    interfaceEnvVar: InterfaceEnvVar;
    interfaceEnvVarJson: string;
    interfaceMountsForm: FormGroup;
    interfaceMount: InterfaceMount;
    interfaceMountsJson: string;
    interfaceMountModeOptions: SelectItem[];
    interfaceSettingsForm: FormGroup;
    interfaceSetting: InterfaceSetting;
    interfaceSettingsJson: string;
    interfaceInputsForm: FormGroup;
    interfaceInput: InterfaceInput;
    interfaceInputsJson: string;
    interfaceInputTypeOptions: SelectItem[];
    interfaceOutputsForm: FormGroup;
    interfaceOutput: InterfaceOutput;
    interfaceOutputsJson: string;
    interfaceOutputTypeOptions: SelectItem[];
    constructor(
        private jobTypesApiService: JobTypesApiService,
        private workspacesApiService: WorkspacesApiService,
        private fb: FormBuilder
    ) {
        this.importForm = this.fb.group({
            'json-editor': new FormControl(''),
            'name': new FormControl('', Validators.required),
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
            'interface-version': new FormControl(''),
            'interface-command': new FormControl('', Validators.required),
            'interface-command_arguments': new FormControl('', Validators.required)
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
        this.interfaceEnvVarsForm = this.fb.group({
            'name': new FormControl('', Validators.required),
            'value': new FormControl('', Validators.required),
            'json-editor': new FormControl('')
        });
        this.interfaceMountsForm = this.fb.group({
            'name': new FormControl('', Validators.required),
            'path': new FormControl('', Validators.required),
            'required': new FormControl(''),
            'mode': new FormControl(''),
            'json-editor': new FormControl('')
        });
        this.interfaceSettingsForm = this.fb.group({
            'name': new FormControl('', Validators.required),
            'required': new FormControl(''),
            'secret': new FormControl(''),
            'json-editor': new FormControl('')
        });
        this.interfaceInputsForm = this.fb.group({
            'name': new FormControl('', Validators.required),
            'type': new FormControl('', Validators.required),
            'media_types': new FormControl(''),
            'partial': new FormControl(''),
            'required': new FormControl(''),
            'json-editor': new FormControl('')
        });
        this.interfaceOutputsForm = this.fb.group({
            'name': new FormControl('', Validators.required),
            'type': new FormControl('', Validators.required),
            'media_types': new FormControl(''),
            'required': new FormControl(''),
            'json-editor': new FormControl('')
        });
        this.items = [
            {
                label: 'General Information'
            },
            {
                label: 'Configuration'
            },
            {
                label: 'Interface'
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
        this.activeGeneralIndex = [];
        this.activeInterfaceIndex = [];
        this.jobType = new JobType('untitled-algorithm', '1.0', new JobTypeInterface(''),
            'Untitled Algorithm');
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
        this.interfaceEnvVar = new InterfaceEnvVar('', '');
        this.interfaceMount = new InterfaceMount('', '');
        this.interfaceMountModeOptions = [
            {
                label: 'Read Only',
                value: 'ro'
            },
            {
                label: 'Read/Write',
                value: 'rw'
            }
        ];
        this.interfaceSetting = new InterfaceSetting('');
        this.interfaceInput = new InterfaceInput('', '');
        this.interfaceInputTypeOptions = [
            {
                label: 'Property',
                value: 'property'
            },
            {
                label: 'File',
                value: 'file'
            },
            {
                label: 'Files',
                value: 'files'
            }
        ];
        this.interfaceOutput = new InterfaceOutput('', '');
        this.interfaceOutputTypeOptions = [
            {
                label: 'File',
                value: 'file'
            },
            {
                label: 'Files',
                value: 'files'
            }
        ];
        this.importForm.valueChanges.subscribe(() => {
            this.items[4].disabled = !this.importForm.valid;
        });
    }
    private stripObject(obj: object) {
        const strippedObj = _.cloneDeep(obj);
        obj = _.pickBy(obj, (value, key) => {
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
        this.getWorkspaces();
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onGeneralAccordionOpen(e) {
        this.activeGeneralIndex.push(e.index);
    }
    onGeneralAccordionClose(e) {
        const idx = this.activeGeneralIndex.indexOf(e.index);
        if (idx > -1) {
            this.activeGeneralIndex.splice(idx, 1);
        }
    }
    onInterfaceAccordionOpen(e) {
        this.activeInterfaceIndex.push(e.index);
    }
    onInterfaceAccordionClose(e) {
        const idx = this.activeInterfaceIndex.indexOf(e.index);
        if (idx > -1) {
            this.activeInterfaceIndex.splice(idx, 1);
        }
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
                if (this.jobType.job_type_interface.env_vars && this.jobType.job_type_interface.env_vars.length > 0) {
                    this.interfaceEnvVarJson = beautify(JSON.stringify(this.jobType.job_type_interface.env_vars));
                }
                if (this.jobType.job_type_interface.mounts && this.jobType.job_type_interface.mounts.length > 0) {
                    this.interfaceMountsJson = beautify(JSON.stringify(this.jobType.job_type_interface.mounts));
                }
                if (this.jobType.job_type_interface.settings && this.jobType.job_type_interface.settings.length > 0) {
                    this.interfaceSettingsJson = beautify(JSON.stringify(this.jobType.job_type_interface.settings));
                }
                if (this.jobType.job_type_interface.input_data && this.jobType.job_type_interface.input_data.length > 0) {
                    this.interfaceInputsJson = beautify(JSON.stringify(this.jobType.job_type_interface.input_data));
                }
                if (this.jobType.job_type_interface.output_data && this.jobType.job_type_interface.output_data.length > 0) {
                    this.interfaceOutputsJson = beautify(JSON.stringify(this.jobType.job_type_interface.output_data));
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
    onTriggerFormSubmit() {
        this.jobType.trigger_rule = this.stripObject(this.trigger);
        this.triggerJson = beautify(JSON.stringify(this.jobType.trigger_rule));
    }
    onTriggerDelete() {
        this.triggerForm.reset();
        this.jobType.trigger_rule = null;
    }
    onInterfaceEnvVarsFormSubmit() {
        this.jobType.job_type_interface.env_vars.push(this.stripObject(this.interfaceEnvVar));
        this.interfaceEnvVarJson = beautify(JSON.stringify(this.jobType.job_type_interface.env_vars));
        this.interfaceEnvVarsForm.reset();
    }
    onInterfaceMountsFormSubmit() {
        this.jobType.job_type_interface.mounts.push(this.stripObject(this.interfaceMount));
        this.interfaceMountsJson = beautify(JSON.stringify(this.jobType.job_type_interface.mounts));
        this.interfaceMountsForm.reset();
    }
    onInterfaceSettingsFormSubmit() {
        this.jobType.job_type_interface.settings.push(this.stripObject(this.interfaceSetting));
        this.interfaceSettingsJson = beautify(JSON.stringify(this.jobType.job_type_interface.settings));
        this.interfaceSettingsForm.reset();
    }
    onInterfaceInputsFormSubmit() {
        this.jobType.job_type_interface.input_data.push(this.stripObject(this.interfaceInput));
        this.interfaceInputsJson = beautify(JSON.stringify(this.jobType.job_type_interface.input_data));
        this.interfaceInputsForm.reset();
    }
    onInterfaceOutputsFormSubmit() {
        this.jobType.job_type_interface.output_data.push(this.stripObject(this.interfaceOutput));
        this.interfaceOutputsJson = beautify(JSON.stringify(this.jobType.job_type_interface.output_data));
        this.interfaceOutputsForm.reset();
    }
    onValidate() {
        this.msgs = [];

        // remove falsey values
        const cleanJobType = this.stripObject(this.jobType);

        // perform validation
        this.jobTypesApiService.validateJobType(cleanJobType).then(result => {
            console.log(result);
        });
    }
    onSubmit(value: string) {
        this.submitted = true;
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Success', detail: 'Form Submitted'});
    }
    get diagnostic() { return JSON.stringify(this.importForm.value); }
}
