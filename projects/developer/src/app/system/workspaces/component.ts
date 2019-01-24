import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { filter, map } from 'rxjs/operators';

import { WorkspacesApiService } from './api.service';
import { Workspace } from './api.model';

@Component({
    selector: 'dev-workspaces',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class WorkspacesComponent implements OnInit, OnDestroy {
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
    workspaces: SelectItem[] = [];
    selectedWorkspace: Workspace;
    selectedWorkspaceDetail: any;
    createForm: any;
    items: MenuItem[] = _.clone(this.viewMenu);
    typeOptions: SelectItem[] = [
        {
            label: 'Host',
            value: 'host'
        },
        {
            label: 'NFS',
            value: 'nfs'
        },
        {
            label: 'S3',
            value: 's3'
        }
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private workspacesApiService: WorkspacesApiService
    ) {
        if (this.router.events) {
            this.routerEvents = this.router.events.pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => this.route)
            ).subscribe(d => {
                this.initFormGroups();
                if (this.route && this.route.queryParams && this.route.paramMap) {
                    this.queryParams = this.route.queryParams.subscribe(queryParams => {
                        this.mode = queryParams.mode || null;
                        this.items = this.mode === 'edit' ? _.clone(this.editMenu) : _.clone(this.viewMenu);
                        let id = null;

                        this.routeParams = this.route.paramMap.subscribe(routeParams => {
                            // get id from url, and convert to an int if not null
                            id = routeParams.get('id');
                            id = id !== null ? +id : id;

                            if (this.workspaces.length === 0) {
                                this.getWorkspaces(id);
                            }
                            this.getWorkspaceDetail(id);
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
            base_url: [''],
            is_active: [false],
            configuration: this.fb.group({
                broker: this.fb.group({
                    type: [''],
                    host_path: [''],
                    nfs_path: [''],
                    bucket_name: [''],
                    credentials: this.fb.group({
                        access_key_id: [''],
                        secret_access_key: ['', Validators.required]
                    }),
                    region_name: ['']
                })
            })
        });
    }

    private initBroker() {
        if (this.selectedWorkspaceDetail.configuration.broker) {
            if (this.selectedWorkspaceDetail.configuration.broker.type === 's3') {
                this.createForm.get('configuration.broker.host_path').enable();
                this.createForm.get('configuration.broker.bucket_name').enable();
                this.createForm.get('configuration.broker.region_name').enable();
                this.createForm.get('configuration.broker.credentials.access_key_id').enable();
                this.createForm.get('configuration.broker.credentials.secret_access_key').enable();
                this.createForm.get('configuration.broker.nfs_path').disable();
            } else if (this.selectedWorkspaceDetail.configuration.broker.type === 'host') {
                this.createForm.get('configuration.broker.host_path').enable();
                this.createForm.get('configuration.broker.bucket_name').disable();
                this.createForm.get('configuration.broker.region_name').disable();
                this.createForm.get('configuration.broker.credentials.access_key_id').disable();
                this.createForm.get('configuration.broker.credentials.secret_access_key').disable();
                this.createForm.get('configuration.broker.nfs_path').disable();
            } else if (this.selectedWorkspaceDetail.configuration.broker.type === 'nfs') {
                this.createForm.get('configuration.broker.host_path').disable();
                this.createForm.get('configuration.broker.bucket_name').disable();
                this.createForm.get('configuration.broker.region_name').disable();
                this.createForm.get('configuration.broker.credentials.access_key_id').disable();
                this.createForm.get('configuration.broker.credentials.secret_access_key').disable();
                this.createForm.get('configuration.broker.nfs_path').enable();
            }
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
    }

    private initWorkspaceForm() {
        if (this.selectedWorkspaceDetail && this.mode === 'edit') {
            // disable the name field if editing an existing workspace
            if (this.selectedWorkspaceDetail.id) {
                this.createForm.get('name').disable();
            }

            // determine which broker fields to display
            this.initBroker();

            // add the values from the object
            this.createForm.patchValue(this.selectedWorkspaceDetail);

            // modify form actions based on status
            this.initValidation();
        }

        // listen for changes to createForm fields
        this.createForm.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.selectedWorkspaceDetail, changes);
            this.initValidation();
        });
    }

    private getWorkspaces(id: number) {
        this.workspaces = [];
        this.loading = true;
        this.workspacesApiService.getWorkspaces({ sortField: 'title' }).subscribe(data => {
            this.loading = false;
            _.forEach(data.results, result => {
                this.workspaces.push({
                    label: result.title,
                    value: result
                });
                if (id && id === result.id) {
                    this.selectedWorkspace = result;
                }
            });
        }, err => {
            this.loading = false;
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
        });
    }

    private getWorkspaceDetail(id: number) {
        if (id > 0) {
            this.loading = true;
            this.workspacesApiService.getWorkspace(id).subscribe(data => {
                this.selectedWorkspaceDetail = data;
                if (this.mode === 'edit') {
                    this.initWorkspaceForm();
                } else {
                    // just looking, so all done
                    this.loading = false;
                }
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspace details', detail: err.statusText});
            });
        } else if (id === 0) {
            // creating a new workspace
            this.selectedWorkspace = null;
            this.selectedWorkspaceDetail = Workspace.transformer(null);
            this.initWorkspaceForm();
        }
    }

    private redirect(id?: number) {
        id = id || this.selectedWorkspaceDetail.id;
        const url = id ? `/system/workspaces/${id}` : '/system/workspaces';
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
        this.router.navigate([`/system/workspaces/${this.selectedWorkspaceDetail.id}`], {
            queryParams: {
                mode: 'edit'
            },
            replaceUrl: true
        });
    }

    onValidateClick() {
        this.workspacesApiService.validateWorkspace(this.selectedWorkspaceDetail.clean()).subscribe(data => {
            if (data.is_valid) {
                if (data.warnings.length > 0) {
                    _.forEach(data.warnings, warning => {
                        this.messageService.add({severity: 'warning', summary: warning.name, detail: warning.description});
                    });
                } else {
                    this.messageService.add({severity: 'success', summary: 'Workspace is valid'});
                }
            } else {
                _.forEach(data.errors, error => {
                    this.messageService.add({severity: 'error', summary: error.name, detail: error.description});
                });
            }
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error validating workspace', detail: err.statusText});
        });
    }

    onSaveClick() {
        if (this.selectedWorkspaceDetail.id) {
            // edit workspace
            const cleanWorkspace = this.selectedWorkspaceDetail.clean();
            this.workspacesApiService.editWorkspace(this.selectedWorkspaceDetail.id, cleanWorkspace).subscribe(data => {
                this.redirect(this.selectedWorkspaceDetail.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error editing workspace', detail: err.statusText});
            });
        } else {
            // create workspace
            this.workspacesApiService.createWorkspace(this.selectedWorkspaceDetail.clean()).subscribe(data => {
                this.redirect(data.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error creating workspace', detail: err.statusText});
            });
        }
    }

    onCancelClick() {
        this.redirect(this.selectedWorkspaceDetail.id);
    }

    onCreateClick(e) {
        if (e.ctrlKey || e.metaKey) {
            window.open('/system/workspaces/0?mode=edit');
        } else {
            this.router.navigate([`/system/workspaces/0`], {
                queryParams: {
                    mode: 'edit'
                },
                replaceUrl: true
            });
        }
    }

    onTypeChange() {
        if (this.selectedWorkspaceDetail.configuration.broker.type === 's3') {
            this.createForm.get('configuration.broker.nfs_path').setValue(null);
        } else if (this.selectedWorkspaceDetail.configuration.broker.type === 'host') {
            this.createForm.get('configuration.broker.bucket_name').setValue(null);
            this.createForm.get('configuration.broker.region_name').setValue(null);
            this.createForm.get('configuration.broker.credentials.access_key_id').setValue(null);
            this.createForm.get('configuration.broker.credentials.secret_access_key').setValue(null);
            this.createForm.get('configuration.broker.nfs_path').setValue(null);
        } else if (this.selectedWorkspaceDetail.configuration.broker.type === 'nfs') {
            this.createForm.get('configuration.broker.bucket_name').setValue(null);
            this.createForm.get('configuration.broker.region_name').setValue(null);
            this.createForm.get('configuration.broker.credentials.access_key_id').setValue(null);
            this.createForm.get('configuration.broker.credentials.secret_access_key').setValue(null);
            this.createForm.get('configuration.broker.host_path').setValue(null);
        }

        // determine which broker fields to display
        this.initBroker();
    }

    onRowSelect(e) {
        this.createForm.reset();
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/system/workspaces/${e.value.id}`);
        } else {
            this.router.navigate([`/system/workspaces/${e.value.id}`]);
        }
    }

    onIsActiveClick(e) {
        e.originalEvent.preventDefault();
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
