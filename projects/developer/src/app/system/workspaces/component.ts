import { Component, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import webkitLineClamp from 'webkit-line-clamp';
import * as _ from 'lodash';

import { WorkspacesApiService } from './api.service';
import { Workspace } from './api.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'dev-workspaces',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class WorkspacesComponent implements OnInit, OnDestroy {
    @ViewChild('dv') dv: any;
    private routeParams: any;
    loading: boolean;
    isEditing: boolean;
    validated: boolean;
    totalRecords: number;
    workspaces: SelectItem[] = [];
    selectedWorkspaceDetail: any;
    createForm: any;
    createFormSubscription: any;
    showActive = true;
    activeLabel = 'Active Workspaces';
    typeOptions: SelectItem[] = [
        {
            label: 'Host',
            value: 'host'
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
    ) {}

    @HostListener('window:beforeunload')
    @HostListener('window:popstate')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.createForm.dirty ) {
            return false;
        } else {
            return true;
        }
    }

    private clampText() {
        setTimeout(() => {
            const clampEls = document.getElementsByClassName('clamp');
            _.forEach(clampEls, el => {
                webkitLineClamp(el, 3);
            });
            // container elements are hidden by default to prevent flash of unstyled content
            const containerEls = document.getElementsByClassName('workspaces__container');
            _.forEach(containerEls, (el: any) => {
                el.style.visibility = 'visible';
            });
        });
    }

    private initFormGroups() {
        this.createForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            base_url: [''],
            is_active: [false],
            configuration: this.fb.group({
                broker: this.fb.group({
                    type: [''],
                    host_path: [''],
                    bucket_name: [''],
                    credentials: this.fb.group({
                        access_key_id: [''],
                        secret_access_key: ['']
                    }),
                    region_name: ['']
                })
            })
        });
        if (this.createForm) {
            this.createForm.get('configuration.broker.host_path').disable();
            this.createForm.get('configuration.broker.bucket_name').disable();
            this.createForm.get('configuration.broker.region_name').disable();
            this.createForm.get('configuration.broker.credentials.access_key_id').disable();
            this.createForm.get('configuration.broker.credentials.secret_access_key').disable();
        }
    }

    private initBroker() {
        if (this.selectedWorkspaceDetail.configuration.broker) {
            if (this.selectedWorkspaceDetail.configuration.broker.type === 's3') {
                this.createForm.get('configuration.broker.host_path').enable();
                this.createForm.get('configuration.broker.bucket_name').enable();
                this.createForm.get('configuration.broker.region_name').enable();
                this.createForm.get('configuration.broker.credentials.access_key_id').enable();
                this.createForm.get('configuration.broker.credentials.secret_access_key').enable();
            } else if (this.selectedWorkspaceDetail.configuration.broker.type === 'host') {
                this.createForm.get('configuration.broker.host_path').enable();
                this.createForm.get('configuration.broker.bucket_name').disable();
                this.createForm.get('configuration.broker.region_name').disable();
                this.createForm.get('configuration.broker.credentials.access_key_id').disable();
                this.createForm.get('configuration.broker.credentials.secret_access_key').disable();
            }
        }
    }

    private initWorkspaceForm() {
        if (this.selectedWorkspaceDetail) {
            // determine which broker fields to display
            this.initBroker();

            // add the values from the object
            this.createForm.patchValue(this.selectedWorkspaceDetail);
        }

        // listen for changes to createForm fields
        this.createFormSubscription = this.createForm.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.selectedWorkspaceDetail, changes);
        });
    }

    private getWorkspaceDetail(id: any) {
        if (id > 0) {
            this.loading = true;
            this.workspacesApiService.getWorkspace(id).subscribe(data => {
                this.selectedWorkspaceDetail = data;
                this.loading = false;
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspace details', detail: err.statusText});
            });
        } else if (id === 'create') {
            // creating a new workspace
            this.isEditing = true;
            this.selectedWorkspaceDetail = Workspace.transformer(null);
            this.initWorkspaceForm();
        }
    }

    private getWorkspaces(id?: any) {
        this.workspaces = [];
        this.loading = true;
        if (!id) {
            // show a grid of workspaces
            this.workspacesApiService.getWorkspaces({
                sortField: 'title',
                rows: 1000
            }).subscribe(data => {
                _.forEach(data.results, result => {
                    this.workspaces.push({
                        label: result.title,
                        value: result
                    });
                });
                this.workspaces = _.orderBy(_.filter(this.workspaces, workspace => {
                    return workspace.value.is_active === this.showActive;
                }), ['value.title'], ['asc']);
                this.totalRecords = this.workspaces.length;
                this.clampText();
                this.loading = false;
            }, err => {
                this.loading = false;
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
            });
        } else {
            // retrieve specific workspace detail
            this.getWorkspaceDetail(id);
        }
    }

    private unsubscribeFromForm() {
        if (this.createFormSubscription) {
            this.createFormSubscription.unsubscribe();
        }
    }

    private redirect(id: any) {
        if (id && id === this.selectedWorkspaceDetail.id) {
            this.isEditing = false;
            this.unsubscribeFromForm();
            this.createForm.reset();
        } else {
            const url = id ? id === 'create' ? '/system/workspaces' : `/system/workspaces/${id}` : '/system/workspaces';
            this.router.navigate([url]);
        }
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    onEditClick() {
        this.isEditing = true;
        this.initWorkspaceForm();
    }

    onValidateClick() {
        this.workspacesApiService.validateWorkspace(this.selectedWorkspaceDetail).subscribe(data => {
            this.validated = data.is_valid;
            if (data.is_valid) {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Validation Successful',
                    detail: 'Workspace is valid and can be created.'
                });
            }
            _.forEach(data.warnings, warning => {
                this.messageService.add({severity: 'warn', summary: warning.name, detail: warning.description});
            });
            _.forEach(data.errors, error => {
                this.messageService.add({severity: 'error', summary: error.name, detail: error.description});
            });
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error validating workspace', detail: err.statusText});
        });
    }

    onSaveClick() {
        if (this.selectedWorkspaceDetail.id) {
            // edit workspace
            this.workspacesApiService.editWorkspace(this.selectedWorkspaceDetail.id, this.selectedWorkspaceDetail).subscribe(() => {
                this.createForm.dirty = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Workspace successfully edited' });
                this.redirect(this.selectedWorkspaceDetail.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error editing workspace', detail: err.statusText});
            });
        } else {
            // create workspace
            this.workspacesApiService.createWorkspace(this.selectedWorkspaceDetail).subscribe(data => {
                this.createForm.dirty = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Workspace successfully created' });
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
            window.open('/system/workspaces/create');
        } else {
            this.router.navigate([`/system/workspaces/create`]);
        }
    }

    onTypeChange() {
        if (this.selectedWorkspaceDetail.configuration.broker.type === 'host') {
            this.createForm.get('configuration.broker.bucket_name').setValue(null);
            this.createForm.get('configuration.broker.region_name').setValue(null);
            this.createForm.get('configuration.broker.credentials.access_key_id').setValue(null);
            this.createForm.get('configuration.broker.credentials.secret_access_key').setValue(null);
        }

        // determine which broker fields to display
        this.initBroker();
    }

    onFilterKeyup(e) {
        this.dv.filter(e.target.value);
        this.clampText();
    }

    onWorkspaceClick(e, workspace) {
        if (e.ctrlKey || e.metaKey) {
            window.open(this.getWorkspaceURL(workspace.value));
        } else {
            this.router.navigate([this.getWorkspaceURL(workspace.value)]);
        }
    }

    /**
     * Get the router link to the workspace detail page.
     * @param  workspace workspace data containing an id field
     * @return           URL to the workspace page
     */
    getWorkspaceURL(workspace: any): string {
        return `/system/workspaces/${workspace.id}`;
    }

    onIsActiveClick(e) {
        e.originalEvent.preventDefault();
    }

    toggleShowActive() {
        this.activeLabel = this.showActive ? 'Active Workspaces' : 'Deprecated Workspaces';
        this.getWorkspaces();
    }

    ngOnInit() {
        this.initFormGroups();
        let id = null;
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(routeParams => {
                this.unsubscribeFromForm();
                this.createForm.reset();

                // get id from url, and convert to an int if not null
                id = routeParams.get('id');
                id = id !== null && id !== 'create' ? +id : id;

                this.isEditing = id === 'create';

                this.getWorkspaces(id);
            });
        }
    }

    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
