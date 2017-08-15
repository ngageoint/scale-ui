import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Message, MenuItem, SelectItem } from 'primeng/primeng';
import * as beautify from 'js-beautify';
import * as _ from 'lodash';

import { JobType } from './api.model';
import { JobTypesApiService } from './api.service';
import * as iconData from './font-awesome.json';
import { JobTypeInterface } from './interface.model';
import { InterfaceEnvVar } from './interface.envvar.model';
import { InterfaceMount } from './interface.mount.model';
import { InterfaceSetting } from './interface.setting.model';
import { InterfaceInput } from './interface.input.model';
import { InterfaceOutput } from './interface.output.model';

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
    jobType: JobType;
    importForm: FormGroup;
    submitted: boolean;
    icons: any;
    items: MenuItem[];
    currentStepIdx: number;
    activeIndex: number[];
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
    interfaceOutput: InterfaceInput;
    interfaceOutputsJson: string;
    interfaceOutputTypeOptions: SelectItem[];
    constructor(
        // private jobTypesApiService: JobTypesApiService,
        private fb: FormBuilder
    ) {
        this.activeIndex = [];
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
        ]
    }
    private stripObject(obj: object) {
        return _.pickBy(obj, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
    }
    ngOnInit() {
        this.importForm = this.fb.group({
            'json': new FormControl(''),
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
            'interface-command-arguments': new FormControl('')
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
            { label: 'General Information' },
            { label: 'Algorithm Interface' },
            { label: 'Validate and Import' }
        ];
    }
    onAccordionOpen(e) {
        this.activeIndex.push(e.index);
    }
    onAccordionClose(e) {
        const idx = this.activeIndex.indexOf(e.index);
        if (idx > -1) {
            this.activeIndex.splice(idx, 1);
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
    onInterfaceEnvVarsFormSubmit(envVar: InterfaceEnvVar) {
        let newEnvVar = {
            name: envVar.name,
            value: envVar.value
        };
        newEnvVar = this.stripObject(newEnvVar);
        this.jobType.job_type_interface.env_vars.push(newEnvVar);
        this.interfaceEnvVarsForm.reset();
        this.interfaceEnvVarJson = beautify(JSON.stringify(this.jobType.job_type_interface.env_vars));
    }
    onInterfaceMountsFormSubmit(mount: InterfaceMount) {
        let newMount = {
            name: mount.name,
            path: mount.path,
            required: mount.required,
            mode: mount.mode
        };
        newMount = this.stripObject(newMount);
        this.jobType.job_type_interface.mounts.push(newMount);
        this.interfaceMountsForm.reset();
        this.interfaceMountsJson = beautify(JSON.stringify(this.jobType.job_type_interface.mounts));
    }
    onInterfaceSettingsFormSubmit(setting: InterfaceSetting) {
        let newSetting = {
            name: setting.name,
            required: setting.required,
            secret: setting.secret
        };
        newSetting = this.stripObject(newSetting);
        this.jobType.job_type_interface.settings.push(newSetting);
        this.interfaceSettingsForm.reset();
        this.interfaceSettingsJson = beautify(JSON.stringify(this.jobType.job_type_interface.settings));
    }
    onInterfaceInputsFormSubmit(input: InterfaceInput) {
        let newInput = {
            name: input.name,
            type: input.type,
            required: input.required,
            partial: input.partial,
            media_types: input.media_types
        };
        newInput = this.stripObject(newInput);
        this.jobType.job_type_interface.input_data.push(newInput);
        this.interfaceInputsForm.reset();
        this.interfaceInputsJson = beautify(JSON.stringify(this.jobType.job_type_interface.input_data));
    }
    onInterfaceOutputsFormSubmit(output: InterfaceOutput) {
        let newOutput = {
            name: output.name,
            type: output.type,
            required: output.required,
            media_types: output.media_types
        };
        newOutput = this.stripObject(newOutput);
        this.jobType.job_type_interface.output_data.push(newOutput);
        this.interfaceOutputsForm.reset();
        this.interfaceOutputsJson = beautify(JSON.stringify(this.jobType.job_type_interface.output_data));
    }
    onSubmit(value: string) {
        this.submitted = true;
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Success', detail: 'Form Submitted'});
    }
    get diagnostic() { return JSON.stringify(this.importForm.value); }
}
