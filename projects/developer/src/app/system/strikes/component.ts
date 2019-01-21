import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { filter, map } from 'rxjs/operators';

import { WorkspacesApiService } from '../workspaces/api.service';
import { StrikesApiService } from './api.service';
import { Strike } from './api.model';
import { IngestFile } from '../../common/models/api.ingest-file.model';

@Component({
    selector: 'dev-strikes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class StrikesComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    private queryParams: any;
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
    workspaces: any = [];
    workspacesOptions: SelectItem[] = [];
    newWorkspacesOptions: SelectItem[] = [];
    ingestFile: any;
    createForm: any;
    ingestFileForm: any;
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
                this.initFormGroups();
                let id = null;
                if (this.route && this.route.queryParams && this.route.paramMap) {
                    this.queryParams = this.route.queryParams.subscribe(queryParams => {
                        this.mode = queryParams.mode || null;
                        this.items = this.mode === 'edit' ? _.clone(this.editMenu) : _.clone(this.viewMenu);
                        this.routeParams = this.route.paramMap.subscribe(routeParams => {
                            // get id from url, and convert to an int if not null
                            id = routeParams.get('id');
                            id = id !== null ? +id : id;

                            if (this.strikes.length === 0) {
                                this.getStrikes(id);
                            }
                            this.getStrikeDetail(id);
                        });
                    });
                }
            });
        }
    }

    private initFormGroups() {
        this.createForm = this.fb.group({
            name: ['', Validators.required],
            title: ['', Validators.required],
            description: [''],
            configuration: this.fb.group({
                workspace: [''],
                monitor: this.fb.group({
                    type: [{value: '', disabled: true}, Validators.required],
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
        this.ingestFileForm = this.fb.group({
            filename_regex: ['', Validators.required],
            data_types: [''],
            new_workspace: [''],
            new_file_path: ['']
        });
    }

    private initNewWorkspacesOptions() {
        // remove currently selected workspace from new_workspace dropdown
        this.newWorkspacesOptions = _.clone(this.workspacesOptions);
        _.remove(this.newWorkspacesOptions, {
            value: this.selectedStrikeDetail.configuration.workspace
        });
    }

    private initMonitor() {
        let monitorType: string = null;
        if (this.selectedStrikeDetail.configuration.monitor) {
            if (this.selectedStrikeDetail.configuration.monitor.type === 's3') {
                monitorType = 'S3';
                this.createForm.get('configuration.monitor.sqs_name').enable();
                this.createForm.get('configuration.monitor.credentials').enable();
                this.createForm.get('configuration.monitor.region_name').enable();
                this.createForm.get('configuration.monitor.transfer_suffix').disable();
            } else if (this.selectedStrikeDetail.configuration.monitor.type === 'dir-watcher') {
                monitorType = 'Directory Watcher';
                this.createForm.get('configuration.monitor.transfer_suffix').enable();
                this.createForm.get('configuration.monitor.sqs_name').disable();
                this.createForm.get('configuration.monitor.credentials').disable();
                this.createForm.get('configuration.monitor.region_name').disable();
            }
            this.createForm.get('configuration.monitor.type').setValue(monitorType);
        }
    }

    private initValidation() {
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
        const status = this.createForm.status === 'INVALID' && this.selectedStrikeDetail.configuration.files_to_ingest.length === 0;
        this.ingestFilePanelClass = status ? 'ui-panel-danger' : 'ui-panel-primary';
    }

    private initStrikeForm() {
        if (this.selectedStrikeDetail && this.mode === 'edit') {
            this.workspacesOptions = [];
            _.forEach(this.workspaces, workspace => {
                this.workspacesOptions.push({
                    label: workspace.title,
                    value: workspace.name
                });
            });

            // remove currently selected workspace from new_workspace dropdown
            this.initNewWorkspacesOptions();

            // disable the name field if editing an existing strike
            if (this.selectedStrikeDetail.id) {
                this.createForm.get('name').disable();
            }

            // determine what to show in monitor input, and which monitor fields to display
            this.initMonitor();

            // iterate over files_to_ingest and add to form array
            const control: any = this.createForm.get('configuration.files_to_ingest');
            _.forEach(this.selectedStrikeDetail.configuration.files_to_ingest, f => {
                control.push(new FormControl(f));
            });
            // add the remaining values from the object
            this.createForm.patchValue(this.selectedStrikeDetail);

            // modify form actions based on status
            this.initValidation();
        }

        // listen for changes to createForm fields
        this.createForm.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.selectedStrikeDetail, changes);
            this.initValidation();
        });

        // listen to changes to ingestFileForm fields
        this.ingestFileForm.valueChanges.subscribe(changes => {
            this.ingestFile = IngestFile.transformer(changes);
        });
    }

    private initEdit() {
        if (this.workspaces.length === 0) {
            this.workspacesApiService.getWorkspaces().subscribe(workspaces => {
                this.loading = false;

                // set up workspaces
                this.workspaces = workspaces.results;

                // set up the form
                this.initStrikeForm();
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
            });
        } else {
            // already have workspaces, so just set up the form
            this.initStrikeForm();
        }
    }

    private getStrikes(id: number) {
        this.strikes = [];
        this.loading = true;
        this.strikesApiService.getStrikes().subscribe(data => {
            this.loading = false;
            _.forEach(data.results, result => {
                this.strikes.push({
                    label: result.title,
                    value: result
                });
                if (id && id === result.id) {
                    this.selectedStrike = result;
                }
            });
        }, err => {
            this.loading = false;
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving strikes', detail: err.statusText});
        });
    }

    private getStrikeDetail(id: number) {
        if (id > 0) {
            this.loading = true;
            this.strikesApiService.getStrike(id).subscribe(data => {
                this.selectedStrikeDetail = data;
                if (this.mode === 'edit') {
                    this.initEdit();
                } else {
                    // just looking, so all done
                    this.loading = false;
                }
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving strike details', detail: err.statusText});
            });
        } else if (id === 0) {
            // creating a new strike
            this.selectedStrike = null;
            this.selectedStrikeDetail = Strike.transformer(null);
            this.initEdit();
        }
    }

    private redirect(id?: number) {
        id = id || this.selectedStrikeDetail.id;
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
        this.router.navigate([`/system/strikes/${this.selectedStrikeDetail.id}`], {
            queryParams: {
                mode: 'edit'
            },
            replaceUrl: true
        });
    }

    onValidateClick() {
        this.strikesApiService.validateStrike(this.selectedStrikeDetail.clean()).subscribe(data => {
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
        if (this.selectedStrikeDetail.id) {
            // edit strike
            this.strikesApiService.editStrike(this.selectedStrikeDetail.id, this.selectedStrikeDetail.clean()).subscribe(data => {
                this.redirect(this.selectedStrikeDetail.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error editing strike', detail: err.statusText});
            });
        } else {
            // create strike
            this.strikesApiService.createStrike(this.selectedStrikeDetail.clean()).subscribe(data => {
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

    onCreateClick(e) {
        if (e.ctrlKey || e.metaKey) {
            window.open('/system/strikes/0?mode=edit');
        } else {
            this.router.navigate([`/system/strikes/0`], {
                queryParams: {
                    mode: 'edit'
                },
                replaceUrl: true
            });
        }
    }

    onWorkspaceChange() {
        const workspaceObj: any = _.find(this.workspaces, { name: this.selectedStrikeDetail.configuration.workspace });
        if (workspaceObj) {
            // remove currently selected workspace from new_workspace dropdown
            this.initNewWorkspacesOptions();

            // get workspace detail to obtain json_config data
            this.workspacesApiService.getWorkspace(workspaceObj.id).subscribe(data => {
                if (data.json_config.broker.type === 'host') {
                    this.selectedStrikeDetail.configuration.monitor.type = 'dir-watcher';
                    this.selectedStrikeDetail.configuration.monitor.sqs_name = null;
                    this.selectedStrikeDetail.configuration.monitor.credentials = {};
                    this.selectedStrikeDetail.configuration.monitor.region_name = null;
                } else if (data.json_config.broker.type === 's3') {
                    this.selectedStrikeDetail.configuration.monitor.type = 's3';
                    this.selectedStrikeDetail.configuration.monitor.transfer_suffix = null;
                } else {
                    this.selectedStrikeDetail.configuration.monitor.type = null;
                }

                // determine what to show in monitor input, and which monitor fields to display
                this.initMonitor();
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspace details', detail: err.statusText});
            });
        }
    }

    onAddRuleClick() {
        const addedFile = this.selectedStrikeDetail.configuration.addIngestFile(this.ingestFile);
        const control: any = this.createForm.get('configuration.files_to_ingest');
        control.push(new FormControl(addedFile));
    }

    onRemoveRuleClick(file) {
        const removedFile = this.selectedStrikeDetail.configuration.removeIngestFile(file);
        const control: any = this.createForm.get('configuration.files_to_ingest');
        const idx = _.findIndex(control.value, removedFile);
        if (idx >= 0) {
            control.removeAt(idx);
        }
    }

    onRowSelect(e) {
        this.createForm.reset();
        this.ingestFileForm.reset();
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/system/strikes/${e.value.id}`);
        } else {
            this.router.navigate([`/system/strikes/${e.value.id}`]);
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        if (this.routerEvents) {
            this.routerEvents.unsubscribe();
        }
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
        if (this.queryParams) {
            this.queryParams.unsubscribe();
        }
    }
}
