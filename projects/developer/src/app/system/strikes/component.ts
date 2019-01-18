import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import {FormBuilder, FormControl} from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { filter, map } from 'rxjs/operators';

import { WorkspacesApiService } from '../../configuration/workspaces/api.service';
import { StrikesApiService } from './api.service';
import { Strike } from './api.model';
import { StrikeIngestFile } from './api.ingest-file.model';

@Component({
    selector: 'dev-strikes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class StrikesComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    private viewMenu: MenuItem[] = [
        { label: 'Edit', icon: 'fa fa-edit', disabled: false, command: () => { this.onEditClick(); } }
    ];
    private editMenu: MenuItem[] = [
        { label: 'Validate', icon: 'fa fa-check', disabled: false, command: () => { this.onValidateClick(); } },
        { label: 'Save', icon: 'fa fa-save', disabled: false, command: () => { this.onSaveClick(); } },
        { separator: true },
        { label: 'Cancel', icon: 'fa fa-remove', disabled: false, command: () => { this.onCancelClick(); } }
    ];
    loading: boolean;
    mode: string;
    strikes: SelectItem[] = [];
    selectedStrike: Strike;
    selectedStrikeDetail: any;
    editedStrikeDetail: any;
    workspaces: any;
    workspacesOptions: SelectItem[] = [];
    newWorkspacesOptions: SelectItem[] = [];
    ingestFile: any;
    createForm = this.fb.group({
        name: ['', Validators.required],
        title: ['', Validators.required],
        description: [''],
        configuration: this.fb.group({
            workspace: [''],
            monitor: this.fb.group({
                type: ['', Validators.required],
                transfer_suffix: ['', Validators.required],
                sqs_name: ['', Validators.required],
                credentials: this.fb.group({
                    access_key_id: [''],
                    secret_access_key: ['', Validators.required]
                }),
                region_name: ['']
            }),
            files_to_ingest: this.fb.array([], Validators.required)
        })
    });
    ingestFileForm = this.fb.group({
        filename_regex: ['', Validators.required],
        data_types: [''],
        new_workspace: [''],
        new_file_path: ['']
    });
    ingestFilePanelClass = 'ui-panel-primary';
    items: MenuItem[] = _.clone(this.viewMenu);

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private workspacesApiService: WorkspacesApiService,
        private strikesApiService: StrikesApiService
    ) {
        if (this.router.events) {
            this.routerEvents = this.router.events.pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => this.route)
            ).subscribe(() => {
                this.strikes = [];
                let id = null;
                if (this.route && this.route.paramMap) {
                    this.routeParams = this.route.paramMap.subscribe(params => {
                        id = params.get('id');
                        id = id !== null ? +id : id;
                    });
                }
                this.loading = true;
                this.strikesApiService.getStrikes().subscribe(data => {
                    _.forEach(data.results, result => {
                        this.strikes.push({
                            label: result.title,
                            value: result
                        });
                        if (id === result.id) {
                            this.selectedStrike = result;
                        }
                    });
                    if (id !== null) {
                        if (id > 0) {
                            this.getStrikeDetail(id);
                        } else {
                            this.loading = false;
                            this.selectedStrikeDetail = Strike.transformer(null);
                            this.initEdit();
                        }
                    } else {
                        this.loading = false;
                    }
                }, err => {
                    this.loading = false;
                    console.log(err);
                    this.messageService.add({severity: 'error', summary: 'Error retrieving strikes', detail: err.statusText});
                });
            });
        }
    }

    private getStrikeDetail(id: number) {
        this.strikesApiService.getStrike(id).subscribe(data => {
            this.loading = false;
            this.selectedStrikeDetail = data;
            if (this.mode === 'edit') {
                this.initEdit();
            } else {
                this.items = _.clone(this.viewMenu);
            }
        }, err => {
            this.loading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving strike details', detail: err.statusText});
        });
    }

    private setMonitorTypeDisplay() {
        let monitorType: string;
        if (this.editedStrikeDetail.configuration.monitor) {
            if (this.editedStrikeDetail.configuration.monitor.type === 's3') {
                monitorType = 'S3';
                this.createForm.get('configuration.monitor.sqs_name').enable();
                this.createForm.get('configuration.monitor.credentials').enable();
                this.createForm.get('configuration.monitor.region_name').enable();
                this.createForm.get('configuration.monitor.transfer_suffix').disable();
            } else if (this.editedStrikeDetail.configuration.monitor.type === 'dir-watcher') {
                monitorType = 'Directory Watcher';
                this.createForm.get('configuration.monitor.transfer_suffix').enable();
                this.createForm.get('configuration.monitor.sqs_name').disable();
                this.createForm.get('configuration.monitor.credentials').disable();
                this.createForm.get('configuration.monitor.region_name').disable();
            }
            this.createForm.get('configuration.monitor.type').setValue(monitorType);
        }
    }

    private initNewWorkspacesOptions(workspaceObj) {
        this.newWorkspacesOptions = _.clone(this.workspacesOptions);
        _.remove(this.newWorkspacesOptions, { value: workspaceObj });
    }

    private initEdit() {
        this.workspacesApiService.getWorkspaces().subscribe(workspaces => {
            // set up workspaces
            this.workspaces = workspaces.results;
            _.forEach(workspaces.results, workspace => {
                this.workspacesOptions.push({
                    label: workspace.title,
                    value: workspace.name
                });
            });

            // set up form
            if (this.selectedStrikeDetail) {
                this.initNewWorkspacesOptions(this.selectedStrikeDetail.configuration.workspace);
                const control: any = this.createForm.get('configuration.files_to_ingest');
                _.forEach(this.selectedStrikeDetail.configuration.files_to_ingest, f => {
                    control.push(new FormControl(f));
                });
                this.items = _.clone(this.editMenu);
                this.editedStrikeDetail = _.clone(this.selectedStrikeDetail);
                this.mode = 'edit';
                if (this.editedStrikeDetail.id) {
                    // editing an existing strike, so disable the name field
                    this.createForm.get('name').disable();
                }
                this.createForm.get('configuration.monitor.type').disable();
                this.createForm.patchValue(this.editedStrikeDetail);
                this.setMonitorTypeDisplay();
            }
            this.createForm.valueChanges.subscribe(changes => {
                // need to merge these changes because there are fields in the model that aren't in the form
                _.merge(this.editedStrikeDetail, changes);

                // enable/disable validate and save actions based on form status
                const validateItem = _.find(this.items, { label: 'Validate' });
                if (validateItem) {
                    validateItem.disabled = this.createForm.status === 'INVALID';
                }
                const saveItem = _.find(this.items, { label: 'Save' });
                if (saveItem) {
                    saveItem.disabled = this.createForm.status === 'INVALID';
                }

                // change ingest file panel based on createForm, because that's where files_to_ingest lives
                const status = this.createForm.status === 'INVALID' && this.editedStrikeDetail.configuration.files_to_ingest.length === 0;
                this.ingestFilePanelClass = status ? 'ui-panel-danger' : 'ui-panel-primary';
            });
            this.ingestFileForm.valueChanges.subscribe(changes => {
                this.ingestFile = StrikeIngestFile.transformer(changes);
            });
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
        });
    }

    private redirect(id?: number) {
        id = id || this.selectedStrikeDetail.id;
        this.mode = null;
        this.items = _.clone(this.viewMenu);
        const url = id ? `/system/strikes/${id}` : '/system/strikes';
        this.router.navigate([url], {
            queryParams: {
                mode: null
            },
            replaceUrl: true
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    onEditClick() {
        this.initEdit();
        if (!this.mode) {
            this.mode = 'edit';
        }
        this.router.navigate([`/system/strikes/${this.selectedStrikeDetail.id}`], {
            queryParams: {
                mode: this.mode
            },
            replaceUrl: true
        });
    }

    onValidateClick() {
        this.strikesApiService.validateStrike(this.editedStrikeDetail.clean()).subscribe(data => {
            if (data.is_valid) {
                if (data.warnings.length > 0) {
                    _.forEach(data.warnings, warning => {
                        this.messageService.add({severity: 'warning', summary: warning.name, detail: warning.description});
                    });
                } else {
                    this.messageService.add({severity: 'success', summary: 'Strike is valid'});
                }
            } else {
                _.forEach(data.errors, error => {
                    this.messageService.add({severity: 'error', summary: error.name, detail: error.description});
                });
            }
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error validating strike', detail: err.statusText});
        });
    }

    onSaveClick() {
        if (this.editedStrikeDetail.id) {
            // edit strike
            this.strikesApiService.editStrike(this.editedStrikeDetail.id, this.editedStrikeDetail.clean()).subscribe(data => {
                this.redirect(this.editedStrikeDetail.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error editing strike', detail: err.statusText});
            });
        } else {
            // create strike
            this.strikesApiService.createStrike(this.editedStrikeDetail.clean()).subscribe(data => {
                this.redirect(data.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error creating strike', detail: err.statusText});
            });
        }
    }

    onCancelClick() {
        this.redirect(this.selectedStrikeDetail.id);
    }

    onCreateClick() {
        this.mode = 'edit';
        this.items = _.clone(this.editMenu);
        this.router.navigate([`/system/strikes/0`], {
            queryParams: {
                mode: 'edit'
            },
            replaceUrl: true
        });
    }

    onWorkspaceChange() {
        const workspaceObj: any = _.find(this.workspaces, { name: this.editedStrikeDetail.configuration.workspace });
        if (workspaceObj) {
            this.initNewWorkspacesOptions(workspaceObj.name);
            this.workspacesApiService.getWorkspace(workspaceObj.id).subscribe(data => {
                if (data.json_config.broker.type === 'host') {
                    this.editedStrikeDetail.configuration.monitor.type = 'dir-watcher';
                    this.editedStrikeDetail.configuration.monitor.sqs_name = null;
                    this.editedStrikeDetail.configuration.monitor.credentials = {};
                    this.editedStrikeDetail.configuration.monitor.region_name = null;
                } else if (data.json_config.broker.type === 's3') {
                    this.editedStrikeDetail.configuration.monitor.type = 's3';
                    this.editedStrikeDetail.configuration.monitor.transfer_suffix = null;
                } else {
                    this.editedStrikeDetail.configuration.monitor.type = null;
                }
                this.createForm.patchValue(this.editedStrikeDetail);
                this.setMonitorTypeDisplay();
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspace details', detail: err.statusText});
            });
        }
    }

    onAddRuleClick() {
        const addedFile = this.editedStrikeDetail.configuration.addFileIngest(this.ingestFile);
        const control: any = this.createForm.get('configuration.files_to_ingest');
        control.push(new FormControl(addedFile));
        console.log(control.value);
    }

    onRemoveRuleClick(file) {
        const removedFile = this.editedStrikeDetail.configuration.removeFileIngest(file);
        const control: any = this.createForm.get('configuration.files_to_ingest');
        const idx = _.findIndex(control.value, removedFile);
        if (idx >= 0) {
            control.removeAt(idx);
        }
        console.log(control.value);
    }

    onRowSelect(e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/system/strikes/${e.value.id}`);
        } else {
            this.router.navigate([`/system/strikes/${e.value.id}`]);
        }
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.mode = params.mode || null;
        });
    }

    ngOnDestroy() {
        if (this.routerEvents) {
            this.routerEvents.unsubscribe();
        }
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
