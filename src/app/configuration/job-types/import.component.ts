import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Message, MenuItem, SelectItem } from 'primeng/primeng';
import * as beautify from 'js-beautify';

import { JobType } from './api.model';
import { JobTypesApiService } from './api.service';
import * as iconData from './font-awesome.json';
import { JobTypeInterface } from './interface.model';
import { InterfaceEnvVar } from './interface.envvar.model';
import { InterfaceMount } from './interface.mount.model';
import { InterfaceSetting } from './interface.setting.model';
import { InterfaceInput } from './interface.input.model';

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
        ]
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
                this.interfaceEnvVarJson = beautify(JSON.stringify(this.jobType.job_type_interface.env_vars));
                this.interfaceMountsJson = beautify(JSON.stringify(this.jobType.job_type_interface.mounts));
                this.interfaceSettingsJson = beautify(JSON.stringify(this.jobType.job_type_interface.settings));
                this.interfaceInputsJson = beautify(JSON.stringify(this.jobType.job_type_interface.input_data));
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
        this.jobType.job_type_interface.env_vars.push({
            name: envVar.name,
            value: envVar.value
        });
        this.interfaceEnvVarsForm.reset();
        this.interfaceEnvVarJson = beautify(JSON.stringify(this.jobType.job_type_interface.env_vars));
    }
    onInterfaceMountsFormSubmit(mount: InterfaceMount) {
        this.jobType.job_type_interface.mounts.push({
            name: mount.name,
            path: mount.path,
            required: mount.required,
            mode: mount.mode
        });
        this.interfaceMountsForm.reset();
        this.interfaceMountsJson = beautify(JSON.stringify(this.jobType.job_type_interface.mounts));
    }
    onInterfaceSettingsFormSubmit(setting: InterfaceSetting) {
        this.jobType.job_type_interface.settings.push({
            name: setting.name,
            required: setting.required,
            secret: setting.secret
        });
        this.interfaceSettingsForm.reset();
        this.interfaceSettingsJson = beautify(JSON.stringify(this.jobType.job_type_interface.settings));
    }
    onInterfaceInputsFormSubmit(input: InterfaceInput) {
        this.jobType.job_type_interface.input_data.push({
            name: input.name,
            type: input.type,
            required: input.required,
            partial: input.partial,
            media_types: input.media_types
        });
        this.interfaceInputsForm.reset();
        this.interfaceInputsJson = beautify(JSON.stringify(this.jobType.job_type_interface.input_data));
    }
    onSubmit(value: string) {
        this.submitted = true;
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Success', detail: 'Form Submitted'});
    }
    get diagnostic() { return JSON.stringify(this.importForm.value); }
}
