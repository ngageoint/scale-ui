import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { WorkspacesApiService } from '../workspaces/api.service';
import { ScansApiService } from './api.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { Scan } from './api.model';
import { IngestFile } from '../../common/models/api.ingest-file.model';

@Component({
    selector: 'dev-scan-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class ScanDetailsComponent implements OnInit, OnDestroy {
    private routeParams: any;
    private viewMenu: MenuItem[] = [
        { label: 'Edit', icon: 'fa fa-edit', disabled: false, command: () => { this.onEditClick(); } },
        { label: 'Duplicate', icon: 'fa fa-copy', disabled: false, command: () => { this.onDuplicateClick(); } }
    ];
    private editMenu: MenuItem[] = [
        { label: 'Validate', icon: 'fa fa-check', disabled: false, command: () => { this.onValidateClick(); } },
        { label: 'Save', icon: 'fa fa-save', disabled: false, command: () => { this.onSaveClick(); } },
        { separator: true },
        { label: 'Cancel', icon: 'fa fa-remove', disabled: false, command: () => { this.onCancelClick(); } }
    ];
    loading: boolean;
    isEditing: boolean;
    validated: boolean;
    scan: any;
    scanJobIcon = '';
    workspaces: any = [];
    workspacesOptions: SelectItem[] = [];
    newWorkspacesOptions: SelectItem[] = [];
    ingestFile: any;
    createForm: any;
    createFormSubscription: any;
    ingestFileForm: any;
    ingestFileFormSubscription: any;
    ingestFilePanelClass = 'ui-panel-primary';
    items: MenuItem[] = _.clone(this.viewMenu);
    recipes: any;
    recipeOptions: SelectItem[] = [];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private workspacesApiService: WorkspacesApiService,
        private scansApiService: ScansApiService,
        private recipeTypesApiService: RecipeTypesApiService
    ) {}

    private initFormGroups() {
        this.createForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            configuration: this.fb.group({
                workspace: [''],
                scanner: this.fb.group({
                    type: [{value: '', disabled: true}, Validators.required],
                    transfer_suffix: ['']
                }),
                recursive: [''],
                files_to_ingest: this.fb.array([], Validators.required),
                recipe: ['']
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
            saveItem.disabled = this.createForm.status === 'INVALID' || !this.validated;
        }

        // change ingest file panel based on createForm, because that's where files_to_ingest lives
        const status = this.createForm.status === 'INVALID' && this.scan.configuration.files_to_ingest.length === 0;
        this.ingestFilePanelClass = status ? 'ui-panel-danger' : 'ui-panel-primary';
    }

    private initScanForm() {
        if (this.scan) {
            this.workspacesOptions = [];
            _.forEach(this.workspaces, workspace => {
                this.workspacesOptions.push({
                    label: workspace.title,
                    value: workspace.name
                });
            });

            _.forEach(this.recipes, recipe => {
                this.recipeOptions.push({
                    label: recipe.title,
                    value: {
                        name: recipe.name,
                        revision_num: recipe.revision_num
                    }
                });
            });

            // remove currently selected workspace from new_workspace dropdown
            this.initNewWorkspacesOptions();


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
            this.workspacesApiService.getWorkspaces({ sortField: 'title' }).subscribe(workspaces => {
                this.loading = false;

                // set up workspaces
                this.workspaces = workspaces.results;

                // get recipe type options
                this.recipeTypesApiService.getRecipeTypes({ sortField: 'title', page: 1, page_size: 1000 }).subscribe(recipes => {
                    this.loading = false;

                    this.recipes = recipes.results;

                    // set up the form
                    this.initScanForm();
                });
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
            });
        } else {
            // already have workspaces, so just set up the form
            this.initScanForm();
        }
    }

    private getScanDetail(id: any) {
        if (id > 0) {
            this.loading = true;
            this.scansApiService.getScan(id).subscribe(data => {
                this.scan = data;
                if (this.scan) {
                    this.scanJobIcon = this.getUnicode(this.scan.job.job_type.icon_code);
                }
                this.loading = false;
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving scan details', detail: err.statusText});
            });
        } else if (id === 'create') {
            // creating a new scan
            this.isEditing = true;
            this.scan = Scan.transformer(null);
            this.initEdit();
        }
    }

    private unsubscribeFromForms() {
        if (this.createFormSubscription) {
            this.createFormSubscription.unsubscribe();
        }
        if (this.ingestFileFormSubscription) {
            this.ingestFileFormSubscription.unsubscribe();
        }
    }

    private redirect(id: any) {
        if (id === this.scan.id) {
            this.isEditing = false;
            this.items = _.clone(this.viewMenu);
            this.unsubscribeFromForms();
            // this.createForm.reset();
            // this.ingestFileForm.reset();
        } else {
            const url = id ? id === 'create' ? '/system/scans' : `/system/scans/${id}` : '/system/scans';
            this.router.navigate([url]);
        }
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    onEditClick() {
        this.isEditing = true;
        this.items = _.clone(this.editMenu);
        this.initEdit();
    }

    onDuplicateClick() {
        this.scan = Scan.transformer(this.scan);
        delete this.scan.id;
        delete this.scan.name;
        this.scan.title += ' copy';
        this.isEditing = true;
        this.items = _.clone(this.editMenu);
        this.initEdit();
    }

    onValidateClick() {
        this.scansApiService.validateScan(this.scan).subscribe(data => {
            this.validated = data.is_valid;
            if (data.is_valid) {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Validation Successful',
                    detail: 'Scan is valid and can be created.'
                });
                this.initValidation();
            }
            _.forEach(data.warnings, warning => {
                this.messageService.add({severity: 'warn', summary: warning.name, detail: warning.description});
            });
            _.forEach(data.errors, error => {
                this.messageService.add({severity: 'error', summary: error.name, detail: error.description});
            });
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error validating scan', detail: err.statusText});
        });
    }

    onSaveClick() {
        if (this.scan.id) {
            // edit scan
            this.scansApiService.editScan(this.scan.id, this.scan).subscribe(() => {
                // kick off scan process on successful edit
                this.scansApiService.processScan(this.scan.id).subscribe(() => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Scan successfully edited' });
                    this.redirect(this.scan.id);
                }, err => {
                    console.log(err);
                    this.messageService.add({severity: 'error', summary: 'Error processing scan', detail: err.statusText});
                });
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error editing scan', detail: err.statusText});
            });
        } else {
            // create scan
            this.scansApiService.createScan(this.scan).subscribe(data => {
                // kick off scan process on successful create
                this.scansApiService.processScan(data.id).subscribe(() => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Scan successfully created' });
                    this.redirect(this.scan.id);
                }, err => {
                    console.log(err);
                    this.messageService.add({severity: 'error', summary: 'Error processing scan', detail: err.statusText});
                });
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error creating scan', detail: err.statusText});
            });
        }
    }

    onCancelClick() {
        this.redirect(this.scan.id || 'create');
    }

    onWorkspaceChange() {
        const workspaceObj: any = _.find(this.workspaces, { name: this.scan.configuration.workspace });
        if (workspaceObj) {
            // remove currently selected workspace from new_workspace dropdown
            this.initNewWorkspacesOptions();

            // get workspace detail to obtain configuration data
            this.workspacesApiService.getWorkspace(workspaceObj.id).subscribe(data => {
                if (data.configuration.broker.type === 'host') {
                    this.scan.configuration.scanner.type = 'dir';
                } else if (data.configuration.broker.type === 's3') {
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
        e.originalEvent.preventDefault();
    }

    ngOnInit() {
        this.initFormGroups();
        let id = null;
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(params => {
                this.unsubscribeFromForms();
                this.createForm.reset();
                this.ingestFileForm.reset();

                // get id from url, and convert to an int if not null
                id = params.get('id');
                id = id !== null && id !== 'create' ? +id : id;

                this.isEditing = id === 'create';
                this.items = id === 'create' ? _.clone(this.editMenu) : _.clone(this.viewMenu);

                this.getScanDetail(id);
            });
        }
    }

    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
