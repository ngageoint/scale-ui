import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { filter, map } from 'rxjs/operators';

import { WorkspacesApiService } from '../../configuration/workspaces/api.service';
import { ScansApiService } from './api.service';
import { Scan } from './api.model';
import { IngestFile } from '../../common/models/api.ingest-file.model';

@Component({
    selector: 'dev-scan-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class ScanDetailsComponent implements OnInit, OnDestroy {
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
    scan: any;
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
        private scansApiService: ScansApiService
    ) {
        if (this.router.events) {
            this.routerEvents = this.router.events.pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => this.route)
            ).subscribe(() => {
                this.initFormGroups();
                let id = null;
                if (this.route && this.route.paramMap) {
                    this.routeParams = this.route.paramMap.subscribe(params => {
                        // get id from url, and convert to an int if not null
                        id = params.get('id');
                        id = id !== null ? +id : id;
                    });
                    this.getScanDetail(id);
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
                scanner: this.fb.group({
                    type: [{value: '', disabled: true}, Validators.required],
                    transfer_suffix: ['', Validators.required]
                }),
                recursive: [''],
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
            value: this.scan.configuration.workspace
        });
    }

    private initScanner() {
        let scannerType: string = null;
        if (this.scan.configuration.scanner) {
            if (this.scan.configuration.scanner.type === 's3') {
                scannerType = 'S3';
                this.createForm.get('configuration.scanner.transfer_suffix').disable();
            } else if (this.scan.configuration.scanner.type === 'dir') {
                scannerType = 'Directory';
                this.createForm.get('configuration.scanner.transfer_suffix').enable();
            }
            this.createForm.get('configuration.scanner.type').setValue(scannerType);
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
        const status = this.createForm.status === 'INVALID' && this.scan.configuration.files_to_ingest.length === 0;
        this.ingestFilePanelClass = status ? 'ui-panel-danger' : 'ui-panel-primary';
    }

    private initScanForm() {
        if (this.scan && this.mode === 'edit') {
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
            if (this.scan.id) {
                this.createForm.get('name').disable();
            }

            // determine what to show in scanner input, and which scanner fields to display
            this.initScanner();

            // iterate over files_to_ingest and add to form array
            const control: any = this.createForm.get('configuration.files_to_ingest');
            _.forEach(this.scan.configuration.files_to_ingest, f => {
                control.push(new FormControl(f));
            });
            // add the remaining values from the object
            this.createForm.patchValue(this.scan);

            // modify form actions based on status
            this.initValidation();
        }

        // listen for changes to createForm fields
        this.createForm.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.scan, changes);
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
                this.initScanForm();
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
            });
        } else {
            // already have workspaces, so just set up the form
            this.initScanForm();
        }
    }

    private getScanDetail(id: number) {
        if (id > 0) {
            this.loading = true;
            this.scansApiService.getScan(id).subscribe(data => {
                this.scan = data;
                if (this.mode === 'edit') {
                    this.initEdit();
                } else {
                    // just looking, so all done
                    this.loading = false;
                }
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving scan details', detail: err.statusText});
            });
        } else if (id === 0) {
            // creating a new scan
            this.scan = Scan.transformer(null);
            this.initEdit();
        }
    }

    private redirect(id?: number) {
        id = id || this.scan.id;
        const url = id ? `/system/scans/${id}` : '/system/scans';
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
        this.router.navigate([`/system/scans/${this.scan.id}`], {
            queryParams: {
                mode: 'edit'
            },
            replaceUrl: true
        });
    }

    onValidateClick() {
        this.scansApiService.validateScan(this.scan.clean()).subscribe(data => {
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
        this.createForm.reset();
        this.ingestFileForm.reset();
        if (this.scan.id) {
            // edit scan
            this.scansApiService.editScan(this.scan.id, this.scan.clean()).subscribe(data => {
                this.redirect(this.scan.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error editing scan', detail: err.statusText});
            });
        } else {
            // create scan
            this.scansApiService.createScan(this.scan.clean()).subscribe(data => {
                this.redirect(data.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error creating scan', detail: err.statusText});
            });
        }
    }

    onCancelClick() {
        this.redirect(this.scan.id);
    }

    onCreateClick() {
        this.router.navigate([`/system/scans/0`], {
            queryParams: {
                mode: 'edit'
            },
            replaceUrl: true
        });
    }

    onWorkspaceChange() {
        const workspaceObj: any = _.find(this.workspaces, { name: this.scan.configuration.workspace });
        if (workspaceObj) {
            // remove currently selected workspace from new_workspace dropdown
            this.initNewWorkspacesOptions();

            // get workspace detail to obtain json_config data
            this.workspacesApiService.getWorkspace(workspaceObj.id).subscribe(data => {
                if (data.json_config.broker.type === 'host') {
                    this.scan.configuration.scanner.type = 'dir';
                } else if (data.json_config.broker.type === 's3') {
                    this.scan.configuration.scanner.type = 's3';
                    this.scan.configuration.scanner.transfer_suffix = null;
                } else {
                    this.scan.configuration.scanner.type = null;
                }

                // determine what to show in scanner input, and which scanner fields to display
                this.initScanner();
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspace details', detail: err.statusText});
            });
        }
    }

    onAddRuleClick() {
        const addedFile = this.scan.configuration.addIngestFile(this.ingestFile);
        const control: any = this.createForm.get('configuration.files_to_ingest');
        control.push(new FormControl(addedFile));
    }

    onRemoveRuleClick(file) {
        const removedFile = this.scan.configuration.removeIngestFile(file);
        const control: any = this.createForm.get('configuration.files_to_ingest');
        const idx = _.findIndex(control.value, removedFile);
        if (idx >= 0) {
            control.removeAt(idx);
        }
    }

    onRecursiveClick(e) {
        console.log(e.checked);
        // this.scan.configuration.recursive = !this.scan.configuration.recursive;
        // this.createForm.get('configuration.recursive').setValue(this.scan.configuration.recursive);
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.mode = params.mode || null;
            this.items = this.mode === 'edit' ? _.clone(this.editMenu) : _.clone(this.viewMenu);
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
