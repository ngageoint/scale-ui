import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
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
    strikes: SelectItem[] = [];
    selectedStrike: Strike;
    selectedStrikeDetail: any;
    strikeJobIcon = '';
    recipes: any = [];
    recipeOptions: SelectItem[] = [];
    selectedRecipe: any;
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

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private workspacesApiService: WorkspacesApiService,
        private strikesApiService: StrikesApiService
    ) {}

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
        if (this.selectedStrikeDetail) {
            this.workspacesOptions = [];
            this.recipeOptions = [];

            _.forEach(this.recipes, recipe => {
                this.recipeOptions.push({
                    label: recipe.title,
                    value: {
                        name: recipe.name,
                        revision_num: recipe.revision_num
                    }
                });
            });

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
        this.createFormSubscription = this.createForm.valueChanges.subscribe(changes => {
            // need to merge these changes because there are fields in the model that aren't in the form
            _.merge(this.selectedStrikeDetail, changes);
            this.initValidation();
        });

        // listen to changes to ingestFileForm fields
        this.ingestFileFormSubscription = this.ingestFileForm.valueChanges.subscribe(changes => {
            this.ingestFile = IngestFile.transformer(changes);
        });
    }

    private initEdit() {
        if (this.workspaces.length === 0) {
            this.workspacesApiService.getWorkspaces({ sortField: 'title' }).subscribe(workspaces => {
                // set up workspaces
                this.workspaces = workspaces.results;

                // get recipe type options
                this.recipeTypesApiService.getRecipeTypes({ sortField: 'title', page: 1, page_size: 1000 }).subscribe(recipes => {
                    this.loading = false;

                    this.recipes = recipes.results;

                    // set up the form
                    this.initStrikeForm();
                });
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
            });
        } else {
            // already have workspaces, so just set up the form
            this.initStrikeForm();
        }
    }

    private getStrikeDetail(id: any) {
        if (id > 0) {
            this.loading = true;
            this.strikesApiService.getStrike(id).subscribe(data => {
                this.selectedStrikeDetail = data;
                if (this.selectedStrikeDetail) {
                    this.strikeJobIcon = this.getUnicode(this.selectedStrikeDetail.job.job_type.icon_code);
                }
                this.loading = false;
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving strike details', detail: err.statusText});
            });
        } else if (id === 'create') {
            // creating a new strike
            this.isEditing = true;
            this.selectedStrike = null;
            this.selectedStrikeDetail = Strike.transformer(null);
            this.initEdit();
        }
    }

    private getStrikes(id: any) {
        this.strikes = [];
        this.loading = true;
        this.strikesApiService.getStrikes({ sortField: 'title' }).subscribe(data => {
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
            this.getStrikeDetail(id);
        }, err => {
            this.loading = false;
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving strikes', detail: err.statusText});
        });
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
        if (id && id === this.selectedStrikeDetail.id) {
            this.isEditing = false;
            this.items = _.clone(this.viewMenu);
            this.unsubscribeFromForms();
            this.createForm.reset();
            this.ingestFileForm.reset();
        } else {
            const url = id ? id === 'create' ? '/system/strikes' : `/system/strikes/${id}` : '/system/strikes';
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
        delete this.selectedStrikeDetail.id;
        this.selectedStrikeDetail.clean();
        this.selectedStrikeDetail.name += ' copy';
        this.isEditing = true;
        this.items = _.clone(this.editMenu);
        this.initEdit();
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
            window.open('/system/strikes/create');
        } else {
            this.router.navigate([`/system/strikes/create`]);
        }
    }

    onWorkspaceChange() {
        const workspaceObj: any = _.find(this.workspaces, { name: this.selectedStrikeDetail.configuration.workspace });
        if (workspaceObj) {
            // remove currently selected workspace from new_workspace dropdown
            this.initNewWorkspacesOptions();

            // get workspace detail to obtain configuration data
            this.workspacesApiService.getWorkspace(workspaceObj.id).subscribe(data => {
                if (data.configuration.broker.type === 'host') {
                    this.selectedStrikeDetail.configuration.monitor.type = 'dir-watcher';
                    this.selectedStrikeDetail.configuration.monitor.sqs_name = null;
                    this.selectedStrikeDetail.configuration.monitor.credentials = {};
                    this.selectedStrikeDetail.configuration.monitor.region_name = null;
                } else if (data.configuration.broker.type === 's3') {
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
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/system/strikes/${e.value.id}`);
        } else {
            this.router.navigate([`/system/strikes/${e.value.id}`]);
        }
    }

    ngOnInit() {
        this.initFormGroups();
        let id = null;
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(routeParams => {
                this.unsubscribeFromForms();
                this.createForm.reset();
                this.ingestFileForm.reset();

                // get id from url, and convert to an int if not null
                id = routeParams.get('id');
                id = id !== null && id !== 'create' ? +id : id;

                this.isEditing = id === 'create';
                this.items = id === 'create' ? _.clone(this.editMenu) : _.clone(this.viewMenu);

                this.getStrikes(id);
            });
        }
    }

    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
