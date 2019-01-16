import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { filter, map } from 'rxjs/operators';

import { WorkspacesApiService } from '../../configuration/workspaces/api.service';
import { StrikesApiService } from './api.service';
import { Strike } from './api.model';

@Component({
    selector: 'dev-strikes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class StrikesComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    private viewMenu: MenuItem[] = [
        { label: 'Edit', icon: 'fa fa-edit', command: () => { this.onEditClick(); } }
    ];
    private editMenu: MenuItem[] = [
        { label: 'Validate', icon: 'fa fa-check', command: () => { this.onValidateClick(); } },
        { label: 'Save', icon: 'fa fa-save', command: () => { this.onSaveClick(); } },
        { separator: true },
        { label: 'Cancel', icon: 'fa fa-remove', command: () => { this.onCancelClick(); } }
    ];
    loading: boolean;
    mode: string;
    strikes: SelectItem[] = [];
    selectedStrike: Strike;
    selectedStrikeDetail: any;
    editedStrikeDetail: any;
    workspaces: any;
    workspacesOptions: SelectItem[] = [];
    createForm = this.fb.group({
        name: [''],
        title: [''],
        description: [''],
        configuration: this.fb.group({
            workspace: [''],
            monitor: this.fb.group({
                type: [''],
                transfer_suffix: [''],
                sqs_name: [''],
                credentials: this.fb.group({
                    access_key_id: [''],
                    secret_access_key: ['']
                }),
                region_name: ['']
            }),
            files_to_ingest: ['']
        })
    });
    ingestFileForm = this.fb.group({
        filename_regex: [''],
        data_types: [''],
        new_workspace: [''],
        new_file_path: ['']
    });
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
                        id = +params.get('id');
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
                    if (id) {
                        this.getStrikeDetail(id);
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
            }
        }, err => {
            this.loading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving strike details', detail: err.statusText});
        });
    }

    private validateForm() {
        console.log('validate form');
    }

    private setMonitorTypeDisplay() {
        // set a friendly name for the monitor type
        const monitorType = this.editedStrikeDetail.configuration.monitor ?
            this.editedStrikeDetail.configuration.monitor.type === 's3' ? 'S3' : 'Directory Watcher' :
            '';
        this.createForm.get('configuration.monitor.type').setValue(monitorType);
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
                this.items = _.clone(this.editMenu);
                this.editedStrikeDetail = _.clone(this.selectedStrikeDetail);
                this.mode = 'edit';
                this.createForm.get('name').disable();
                this.createForm.get('configuration.monitor.type').disable();
                this.createForm.patchValue(this.editedStrikeDetail);
                this.setMonitorTypeDisplay();
            } else {
                this.mode = 'Create';
                this.editedStrikeDetail = Strike.transformer(null);
                this.createForm.patchValue(this.editedStrikeDetail);
            }
            this.createForm.valueChanges.subscribe(changes => {
                _.merge(this.editedStrikeDetail, changes);
                this.validateForm();
            });
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    onEditClick() {
        this.initEdit();
        this.router.navigate([`/system/strikes/${this.selectedStrikeDetail.id}`], {
            queryParams: {
                mode: this.mode
            },
            replaceUrl: true
        });
    }

    onValidateClick() {
        console.log('validate');
    }

    onSaveClick() {
        console.log('save');
    }

    onCancelClick() {
        this.mode = null;
        this.items = _.clone(this.viewMenu);
        this.router.navigate([`/system/strikes/${this.selectedStrikeDetail.id}`], {
            queryParams: {
                mode: null
            },
            replaceUrl: true
        });
    }

    onWorkspaceChange() {
        const workspaceObj: any = _.find(this.workspaces, { name: this.editedStrikeDetail.configuration.workspace });
        if (workspaceObj) {
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
