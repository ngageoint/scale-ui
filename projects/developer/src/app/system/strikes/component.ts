import { Component, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem, SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import webkitLineClamp from 'webkit-line-clamp';
import * as _ from 'lodash';

import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { WorkspacesApiService } from '../workspaces/api.service';
import { StrikesApiService } from './api.service';
import { JobsApiService } from '../../processing/jobs/api.service';
import { Strike } from './api.model';
import { IngestFile } from '../../common/models/api.ingest-file.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'dev-strikes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class StrikesComponent implements OnInit, OnDestroy {
    @ViewChild('dv') dv: any;
    private routeParams: any;
    loading: boolean;
    isEditing: boolean;
    isSaving = false;
    validated: boolean;
    strikes: SelectItem[] = [];
    selectedStrikeDetail: any;
    strikeJobIcon = '';
    totalRecords: number;
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

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private workspacesApiService: WorkspacesApiService,
        private strikesApiService: StrikesApiService,
        private jobsApiService: JobsApiService
    ) {}

    @HostListener('window:beforeunload')
    @HostListener('window:popstate')
    canDeactivate(): Observable<boolean> | boolean {
        if (!this.isSaving) {
            if (this.createForm.dirty || this.ingestFileForm.dirty) {
                return false;
            } else {
                return true;
            }
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
            const containerEls = document.getElementsByClassName('strikes__container');
            _.forEach(containerEls, (el: any) => {
                el.style.visibility = 'visible';
            });
        });
    }

    private initFormGroups() {
        this.createForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            configuration: this.fb.group({
                workspace: [''],
                monitor: this.fb.group({
                    type: [{value: '', disabled: true}, Validators.required],
                    transfer_suffix: [''],
                    sqs_name: ['', Validators.required],
                    credentials: this.fb.group({
                        access_key_id: [''],
                        secret_access_key: ['']
                    }),
                    region_name: ['']
                }),
                files_to_ingest: this.fb.array([], Validators.required),
                recipe: ['', Validators.required]
            })
        });
        const hi = 'hi';
        console.log(this.createForm);
        console.log(this.createForm.controls.configuration.controls.monitor.controls['transfer_suffix']);
        this.createForm.get('description').patchValue(hi);
        console.log(this.createForm);
        this.ingestFileForm = this.fb.group({
            filename_regex: ['', Validators.required],
            data_types: [''],
            new_workspace: [''],
            new_file_path: ['']
        });
        if (this.createForm) {
            this.createForm.get('configuration.monitor.sqs_name').disable();
            this.createForm.get('configuration.monitor.credentials').disable();
            this.createForm.get('configuration.monitor.region_name').disable();
            this.createForm.get('configuration.monitor.transfer_suffix').disable();
        }
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
        // change ingest file panel based on createForm, because that's where files_to_ingest lives
        const status = this.createForm.status === 'INVALID' && this.selectedStrikeDetail.configuration.files_to_ingest.length === 0;
        this.ingestFilePanelClass = status ? 'ui-panel-danger' : 'ui-panel-primary';
    }

    private initStrikeForm() {
        this.isSaving = false;
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
        this.isSaving = false;
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
            this.selectedStrikeDetail = Strike.transformer(null);
            this.initEdit();
        }
    }

    private getStrikes(id: any) {
        this.strikes = [];
        this.loading = true;
        if (!id) {
            // show a grid of strikes
            this.strikesApiService.getStrikes({ sortField: 'title', rows: 1000 }).subscribe(data => {
                this.totalRecords = data.count;
                _.forEach(data.results, result => {
                    this.strikes.push({
                        label: result.title,
                        value: result
                    });
                });
                this.clampText();
                this.loading = false;
            }, err => {
                this.loading = false;
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error retrieving strikes', detail: err.statusText});
            });
        } else {
            // retrieve specific strike detail
            this.getStrikeDetail(id);
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
        if (id && id === this.selectedStrikeDetail.id) {
            this.isEditing = false;
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
        this.initEdit();
    }

    onDuplicateClick() {
        this.selectedStrikeDetail = Strike.transformer(this.selectedStrikeDetail);
        delete this.selectedStrikeDetail.id;
        delete this.selectedStrikeDetail.name;
        this.selectedStrikeDetail.title += ' copy';
        this.isEditing = true;
        this.initEdit();
    }

    onValidateClick() {
        this.strikesApiService.validateStrike(this.selectedStrikeDetail).subscribe(data => {
            this.validated = data.is_valid;
            if (data.is_valid) {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Validation Successful',
                    detail: 'Strike is valid and can be created.'
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
            this.messageService.add({severity: 'error', summary: 'Error validating strike', detail: err.statusText});
        });
    }

    onSaveClick() {
        if (this.selectedStrikeDetail.id) {
            // edit strike
            this.strikesApiService.editStrike(this.selectedStrikeDetail.id, this.selectedStrikeDetail).subscribe(() => {
                this.isSaving = true;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Strike successfully edited' });
                this.redirect(this.selectedStrikeDetail.id);
            }, err => {
                console.log(err);
                this.messageService.add({severity: 'error', summary: 'Error editing strike', detail: err.statusText});
            });
        } else {
            // create strike
            this.strikesApiService.createStrike(this.selectedStrikeDetail).subscribe(data => {
                this.isSaving = true;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Strike successfully created' });
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
                if (data.configuration.broker.type === 'host' || data.configuration.broker.type === 'nfs') {
                    this.selectedStrikeDetail.configuration.monitor.type = 'dir-watcher';
                    this.selectedStrikeDetail.configuration.monitor.sqs_name = null;
                    this.selectedStrikeDetail.configuration.monitor.credentials = null;
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

    onFilterKeyup(e) {
        this.dv.filter(e.target.value);
        this.clampText();
    }

    onStrikeClick(e, strike) {
        if (e.ctrlKey || e.metaKey) {
            window.open(this.getStrikeURL(strike.value));
        } else {
            this.router.navigate([this.getStrikeURL(strike.value)]);
        }
    }

    /**
     * Get the router link to the strike detail page.
     * @param  strike strike data containing an id
     * @return        the URL to the strike detail
     */
    getStrikeURL(strike: any): string {
        return `/system/strikes/${strike.id}`;
    }

    requeueJob(jobId: number): void {
        this.messageService.add({severity: 'success', summary: 'Job requeue has been requested'});
        this.jobsApiService.requeueJobs({job_ids: [jobId]})
            .subscribe(() => {}, err => {
                this.messageService.add({severity: 'error', summary: 'Error requeuing job', detail: err.statusText});
            });
    }

    cancelJob(jobId: number): void {
        this.messageService.add({severity: 'success', summary: 'Job cancellation has been requested'});
        this.jobsApiService.cancelJobs({job_ids: [jobId]})
            .subscribe(() => {}, err => {
                this.messageService.add({severity: 'error', summary: 'Error canceling job', detail: err.statusText});
            });
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
