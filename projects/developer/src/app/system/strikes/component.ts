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
    loading: boolean;
    mode: string;
    strikes: SelectItem[] = [];
    selectedStrike: Strike;
    selectedStrikeDetail: any;
    workspaces: SelectItem[] = [];
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
    items: MenuItem[] = [
        { label: 'Edit', icon: 'fa fa-edit', command: () => { this.onEditClick(); } }
    ];

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
        }, err => {
            this.loading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving strike details', detail: err.statusText});
        });
    }

    private validateForm() {
        console.log('validate form');
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    onEditClick() {
        if (this.selectedStrikeDetail) {
            this.items = [
                { label: 'Validate', icon: 'fa fa-check', command: () => { this.onValidateClick(); } },
                { label: 'Save', icon: 'fa fa-save', command: () => { this.onSaveClick(); } },
                { separator: true },
                { label: 'Cancel', icon: 'fa fa-remove', command: () => { this.onCancelClick(); } }
            ];
            this.mode = 'edit';
            this.createForm.get('name').disable();
            this.createForm.get('configuration.monitor.type').disable();
            this.createForm.patchValue(this.selectedStrikeDetail);
            // set a friendly name for the monitor type
            const monitorType = this.selectedStrikeDetail.configuration.monitor ?
                this.selectedStrikeDetail.configuration.monitor.type === 's3' ? 'S3' : 'Directory Watcher' :
                '';
            this.createForm.get('configuration.monitor.type').setValue(monitorType);
        } else {
            this.mode = 'Create';
            this.selectedStrikeDetail = Strike.transformer(null);
            this.createForm.patchValue(this.selectedStrikeDetail);
        }
        this.createForm.valueChanges.subscribe(changes => {
            this.validateForm();
            console.log(changes);
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
        this.items = [
            { label: 'Edit', icon: 'fa fa-edit', command: () => { this.onEditClick(); } }
        ];
    }

    onRowSelect(e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/system/strikes/${e.value.id}`);
        } else {
            this.router.navigate([`/system/strikes/${e.value.id}`]);
        }
    }

    ngOnInit() {
        this.workspacesApiService.getWorkspaces().subscribe(workspaces => {
            _.forEach(workspaces.results, workspace => {
                this.workspaces.push({
                    label: workspace.title,
                    value: workspace.name
                });
            });
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
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
