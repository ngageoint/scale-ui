import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import * as beautify from 'js-beautify';
import * as _ from 'lodash';
import { ComponentCanDeactivate } from '../../pending-changes.guard';
import { HostListener } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';

import { DataService } from '../../common/services/data.service';
import { JobType } from './api.model';
import { JobTypesApiService } from './api.service';
import { iconData } from './font-awesome.json';
import { WorkspacesApiService } from '../../system/workspaces/api.service';

@Component({
    selector: 'dev-job-types-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class JobTypesCreateComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
    private routeParams: any;
    // keep track of name and version since they're stripped out while editing
    private name: string;
    private version: string;
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
    workspaces = [];
    workspacesOptions: SelectItem[] = [];
    jobType: any;
    createForm: FormGroup = this.fb.group({
        icon_code: [''],
        is_published: [false],
        is_active: [true],
        is_paused: [false],
        max_scheduled: [],
        docker_image: [''],
        configuration: this.fb.group({
            priority: ['', Validators.required],
            output_workspaces: this.fb.group({
                default: ['', Validators.required],
                outputs: this.fb.group({})
            }),
            mounts: this.fb.group({}),
            settings: this.fb.group({})
        })
    });
    driverOptsForm: FormGroup = this.fb.group({
        key: [''],
        value: ['']
    });
    mountTypeOptions: SelectItem[] = [
        {
            label: 'Host',
            value: 'host'
        },
        {
            label: 'Volume',
            value: 'volume'
        }
    ];
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
        private route: ActivatedRoute
    ) {}

    @HostListener('window:beforeunload')
    @HostListener('window:popstate')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.createForm.dirty) {
            return false;
        } else {
            return true;
        }
    }

    private validateForm() {
        // only enable 'Validate and Create' when the form is valid
        this.items[this.items.length - 1].disabled = !this.createForm.valid ||
            !this.jobType.manifest ||
            _.keys(this.jobType.manifest).length === 0;
    }

    private initCreateForm() {
        if (this.jobType) {
            this.workspacesOptions = [];
            // set up workspaces
            _.forEach(this.workspaces, workspace => {
                this.workspacesOptions.push({
                    label: workspace.title,
                    value: workspace.name
                });
            });

            // add the remaining values from the object
            this.createForm.patchValue(this.jobType);
        }

        // listen for changes to createForm fields
        this.createForm.valueChanges.subscribe(changes => {
            // force re-validation
            this.validated = false;
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.jobType, changes);
            this.validateForm();
        });
        this.createForm.updateValueAndValidity();
    }

    private hasInterface() {
        return this.jobType.manifest && this.jobType.manifest.job && this.jobType.manifest.job.interface;
    }

    private initJobTypeConfiguration() {
        // set up output workspaces
        if (this.jobType.manifest.job.interface && this.jobType.manifest.job.interface.outputs
            && this.jobType.manifest.job.interface.outputs.files) {
            // iterate over job manifest output files and add appropriate properties and form controls
            const outputsGroup: any = this.createForm.get('configuration.output_workspaces.outputs');
            if (!this.jobType.configuration.output_workspaces.outputs) {
                this.jobType.configuration.output_workspaces.outputs = {};
            }
            _.forEach(this.jobType.manifest.job.interface.outputs.files, file => {
                this.jobType.configuration.output_workspaces.outputs[file.name] = null;
                outputsGroup.addControl(file.name, new FormControl(null));
            });
        }

        // set up settings
        if (this.jobType.manifest.job.interface && this.jobType.manifest.job.interface.settings) {
            // iterate over job manifest settings and add appropriate job type settings
            const settingsGroup: any = this.createForm.get('configuration.settings');
            _.forEach(this.jobType.manifest.job.interface.settings, setting => {
                if (this.mode === 'Create') {
                    this.jobType.configuration.settings[setting.name] = null;
                }
                settingsGroup.addControl(setting.name, new FormControl(null));
            });
        }

        // set up mounts
        if (this.jobType.manifest.job.interface && this.jobType.manifest.job.interface.mounts) {
            // iterate over mounts in job manifest and add appropriate job type mounts
            const mountsGroup: any = this.createForm.get('configuration.mounts');
            _.forEach(this.jobType.manifest.job.interface.mounts, mount => {
                if (this.mode === 'Create') {
                    this.jobType.configuration.mounts[mount.name] = {
                        type: null,
                        host_path: null,
                        driver: null,
                        driver_opts: {}
                    };
                }
                const mountObj = this.jobType.configuration.mounts[mount.name];
                mountsGroup.addControl(mount.name, new FormGroup({}));
                const mountGroup: any = this.createForm.get(`configuration.mounts.${mount.name}`);
                mountGroup.addControl('type', new FormControl(mountObj.type, Validators.required));
                if (mountObj.type === 'host' || this.mode === 'Create') {
                    mountGroup.addControl('host_path', new FormControl(mountObj.host_path || null, Validators.required));
                }
                mountGroup.addControl('driver', new FormControl(mountObj.driver || null));
                mountGroup.addControl('driver_opts', new FormControl(mountObj.driver_opts || {}));
            });
        }
    }

    private getWorkspaces() {
        this.workspacesApiService.getWorkspaces({ sortField: 'title' }).subscribe(data => {
            this.workspaces = data.results;
            this.initCreateForm();
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
        });
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
        if (index === 3) {
            // remove falsey values when viewing the "Validate and Create" step
            DataService.removeEmpty(this.jobType.configuration);
        }
    }

    onImageImport(seedImage) {
        // use the information from seed-images to select the proper version and package
        const job: any = _.find(seedImage.job.JobVersions, { JobVersion: seedImage.selectedJobVersion });
        const image: any = job ? _.find(job.Images, { PackageVersion: seedImage.selectedPackageVersion }) : null;
        if (job.URL) {
            this.jobType.docker_image = job.URL;
        } else {
            this.jobType.manifest = seedImage.manifest;
            if (job && image) {
                this.jobType.docker_image = image.Org ? `${image.Registry}/${image.Org}/${image.Name}` : `${image.Registry}/${image.Name}`;
            } else {
                this.jobType.docker_image = null;
            }
        }
        this.createForm.patchValue({docker_image: this.jobType.docker_image});

        // alert user if docker image cannot be determined from imported seed image
        if (!job || !image) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Missing Seed Image Job/Package Version',
                detail: 'Unable to determine seed image job or package version. Docker Image for this job type must be manually specified.'
            });
        }

        this.initJobTypeConfiguration();
    }

    onImageRemove() {
        this.jobType.configuration = {
            output_workspaces: {
                default: '',
                outputs: {}
            },
            mounts: {},
            settings: {}
        };
        this.jobType.manifest = null;
        delete this.jobType.docker_image;
        this.validated = false;
    }

    onValidate() {
        // remove falsey values
        DataService.removeEmpty(this.jobType.configuration);
        // perform validation
        this.jobTypesApiService.validateJobType(_.cloneDeep(this.jobType)).subscribe(result => {
            if (!result.is_valid) {
                this.validated = false;
                _.forEach(result.warnings, warning => {
                    this.messageService.add({ severity: 'warn', summary: warning.name, detail: warning.description, sticky: true });
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
        this.jobType.icon_code = this.createForm.get('icon_code').value;
    }

    onMountTypeChange(e, mount) {
        const mountGroup: any = this.createForm.get(`configuration.mounts.${mount}`);
        mountGroup.addControl('host_path', new FormControl(null, Validators.required));
        mountGroup.addControl('driver', new FormControl(null));
        mountGroup.addControl('driver_opts', new FormGroup({}));
        if (e.value === 'host') {
            mountGroup.removeControl('driver');
            mountGroup.removeControl('driver_opts');
        } else if (e.value === 'volume') {
            mountGroup.removeControl('host_path');
        }
    }

    addMountOption(mount) {
        this.jobType.configuration.mounts[mount].driver_opts[this.driverOptsForm.get('key').value] = this.driverOptsForm.get('value').value;
        this.driverOptsForm.reset();
    }

    onSubmit() {
        this.submitted = true;
        if (this.mode === 'Create') {
            // remove falsey values
            DataService.removeEmpty(this.jobType.configuration);
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
            this.jobTypesApiService.updateJobType(this.jobType, this.name, this.version).subscribe(result => {
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

    onInputSwitchChange(e) {
        e.originalEvent.preventDefault();
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

        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(params => {
                this.name = params.get('name');
                this.version = params.get('version');

                if (this.name && this.version) {
                    this.mode = 'Edit';
                    this.jobTypesApiService.getJobType(this.name, this.version).subscribe(data => {
                        this.jobType = JobType.cleanJobTypeForUpdate(data);
                        this.jobType.manifest = data.manifest;
                        this.getWorkspaces();
                        this.initJobTypeConfiguration();
                    });
                } else {
                    this.mode = 'Create';
                    this.jobType = JobType.transformer(null);
                    this.getWorkspaces();
                }

                this.items = [
                    {
                        label: 'Seed Image',
                        disabled: this.mode === 'Edit'
                    },
                    {
                        label: 'Configuration'
                    },
                    {
                        label: 'General Information'
                    },
                    {
                        label: 'Validate and Create',
                        disabled: !this.createForm.valid
                    }
                ];
                this.currentStepIdx = this.mode === 'Create' ? 0 : 1;
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
