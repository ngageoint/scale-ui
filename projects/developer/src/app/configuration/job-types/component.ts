import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/primeng';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import webkitLineClamp from 'webkit-line-clamp';
import * as _ from 'lodash';

import { JobTypesApiService } from './api.service';
import { ColorService } from '../../common/services/color.service';
import { WorkspacesApiService } from '../../system/workspaces/api.service';
import { ScansApiService } from '../../system/scans/api.service';
import { DashboardJobsService } from '../../dashboard/jobs.service';

@Component({
    selector: 'dev-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobTypesComponent implements OnInit, OnDestroy {
    @ViewChild('dv') dv: any;
    private routeParams: any;
    private itemsWithPause: MenuItem[] = [
        { label: 'Pause', icon: 'fa fa-pause', command: () => { this.onPauseClick(); } },
        { label: 'Edit', icon: 'fa fa-edit', command: () => { this.onEditClick(); } },
        { label: 'Scan', icon: 'fa fa-barcode', command: () => { this.scanDisplay = true; } },
        { label: 'Favorite', icon: 'fa fa-star-o', command: ($event) => { this.toggleFavorite($event.originalEvent); } }
    ];
    private itemsWithResume: MenuItem[] = [
        { label: 'Resume', icon: 'fa fa-play', command: () => { this.onPauseClick(); } },
        { label: 'Edit', icon: 'fa fa-edit', command: () => { this.onEditClick(); } },
        { label: 'Scan', icon: 'fa fa-barcode', command: () => { this.scanDisplay = true; } },
        { label: 'Favorite', icon: 'fa fa-star-o', command: ($event) => { this.toggleFavorite($event.originalEvent); } }
    ];
    isFavorite: any;
    rows = 16;
    jobTypes: SelectItem[];
    totalRecords: number;
    selectedJobTypeDetail: any;
    options: any;
    items: MenuItem[];
    scanDisplay: boolean;
    workspaces: SelectItem[] = [];
    selectedWorkspace: any;
    isScanning: boolean;
    scanProgress = 0;
    scanBtnIcon = 'fa fa-barcode';
    interfaceClass = 'p-col-6';
    errorClass = 'p-col-6';
    loadingJobTypes: boolean;
    showFavorites: boolean;
    showActive = true;
    favoritesBtnIcon = 'fa fa-remove';
    favoritesBtnLabel = 'Favorites';
    favoritesBtnClass = 'ui-button-secondary';
    activeLabel = 'Active Job Types';

    constructor(
        private messageService: MessageService,
        private jobTypesApiService: JobTypesApiService,
        private colorService: ColorService,
        private workspacesApiService: WorkspacesApiService,
        private scansApiService: ScansApiService,
        private dashboardJobsService: DashboardJobsService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    private clampText() {
        setTimeout(() => {
            const clampEls = document.getElementsByClassName('clamp');
            _.forEach(clampEls, el => {
                webkitLineClamp(el, 3);
            });
            // container elements are hidden by default to prevent flash of unstyled content
            const containerEls = document.getElementsByClassName('job-type__container');
            _.forEach(containerEls, (el: any) => {
                el.style.visibility = 'visible';
            });
        });
    }
    private setFavoriteIcon(jobType?: any) {
        jobType = jobType || null;
        if (this.selectedJobTypeDetail) {
            this.selectedJobTypeDetail.favoriteIcon = this.isFavorite ? 'fa fa-star' : 'fa fa-star-o';
        } else {
            if (jobType) {
                jobType.favoriteIcon = this.isFavorite ? 'fa fa-star' : 'fa fa-star-o';
            }
        }
        const favoriteItem: any = _.find(this.items, { label: 'Favorite' });
        if (favoriteItem) {
            favoriteItem.icon = this.isFavorite ? 'fa fa-star' : 'fa fa-star-o';
        }
    }
    private getJobTypeDetail(name: string, version: string) {
        this.jobTypesApiService.getJobType(name, version).subscribe(data => {
            this.selectedJobTypeDetail = data;
            this.isFavorite = this.dashboardJobsService.isFavorite(this.selectedJobTypeDetail);
            if (data.manifest.job.interface && data.manifest.job.errors) {
                this.interfaceClass = 'p-col-6';
                this.errorClass = 'p-col-6';
            } else if (data.manifest.job.interface && !data.manifest.job.errors) {
                this.interfaceClass = 'p-col-12';
            } else if (!data.manifest.job.interface && data.manifest.job.errors) {
                this.errorClass = 'p-col-12';
            }
            this.items = this.selectedJobTypeDetail.is_paused ? _.clone(this.itemsWithResume) : _.clone(this.itemsWithPause);
            this.setFavoriteIcon();
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type details', detail: err.statusText, life: 10000});
        });
    }
    private getJobTypes(params?: any) {
        this.loadingJobTypes = true;
        this.jobTypes = [];
        params = params || {
            rows: 1000,
            is_active: this.showActive,
            sortField: 'title'
        };
        this.jobTypesApiService.getJobTypes(params).subscribe(data => {
            this.totalRecords = data.count;
            _.forEach(data.results, result => {
                this.jobTypes.push({
                    label: `${result.title} ${result.version}`,
                    value: result
                });
            });
            this.jobTypes = _.orderBy(this.jobTypes, ['value.title'], ['asc']);
            if (this.showFavorites) {
                this.jobTypes = _.filter(this.jobTypes, jt => {
                    return typeof this.dashboardJobsService.isFavorite(jt.value) !== 'undefined';
                });
            }
            this.clampText();
            this.loadingJobTypes = false;
        }, err => {
            console.log(err);
            this.loadingJobTypes = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type', detail: err.statusText});
        });
    }
    private getWorkspaces() {
        this.workspacesApiService.getWorkspaces().subscribe(data => {
            _.forEach(data.results, (result) => {
                this.workspaces.push({
                    label: result.title,
                    value: result
                });
            });
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
        });
    }
    private handleScanError(err) {
        console.log(err);
        this.isScanning = false;
        this.scanBtnIcon = 'fa fa-barcode';
        this.scanProgress = 0;
        this.messageService.add({severity: 'error', summary: 'Error creating scan', detail: err.statusText});
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onJobTypeClick(e, jobType) {
        if (e.ctrlKey || e.metaKey) {
            window.open(`/configuration/job-types/${jobType.value.name}/${jobType.value.version}`);
        } else {
            this.router.navigate([`/configuration/job-types/${jobType.value.name}/${jobType.value.version}`]);
        }
    }
    onPauseClick() {
        this.jobTypesApiService.validateJobType(this.selectedJobTypeDetail).subscribe(result => {
            if (!result.is_valid) {
                _.forEach(result.warnings, warning => {
                    this.messageService.add({ severity: 'warn', summary: warning.name, detail: warning.description, sticky: true });
                });
                _.forEach(result.errors, error => {
                    this.messageService.add({ severity: 'error', summary: error.name, detail: error.description, sticky: true });
                });
            } else {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Validation Successful',
                    detail: 'Job Type is valid and can be created.'
                });
                this.jobTypesApiService.updateJobType(this.selectedJobTypeDetail).subscribe(data => {
                    this.selectedJobTypeDetail = data;
                    this.items = this.selectedJobTypeDetail.is_paused ? _.clone(this.itemsWithResume) : _.clone(this.itemsWithPause);
                }, err => {
                    this.messageService.add({severity: 'error', summary: 'Error updating job type', detail: err.statusText});
                });
            }
        }, err => {
            console.log(err);
            this.messageService.add({ severity: 'error', summary: 'Error validating job type', detail: err.statusText });
        });
    }
    onEditClick() {
        this.router.navigate([`/configuration/job-types/edit/${this.selectedJobTypeDetail.name}/${this.selectedJobTypeDetail.version}`]);
    }
    onScanHide() {
        this.selectedWorkspace = null;
    }
    onFilterKeyup(e) {
        this.dv.filter(e.target.value);
        this.clampText();
    }
    onFilterBtnClick() {
        this.showFavorites = !this.showFavorites;
        this.favoritesBtnClass = this.showFavorites ? 'ui-button-primary' : 'ui-button-secondary';
        this.favoritesBtnIcon = this.showFavorites ? 'fa fa-check' : 'fa fa-remove';
        this.getJobTypes();
    }
    toggleShowActive() {
        this.activeLabel = this.showActive ? 'Active Job Types' : 'Deprecated Job Types';
        this.getJobTypes();
    }
    scanWorkspace() {
        const scanObj = {
            id: this.selectedJobTypeDetail.id,
            trigger_rule: {
                configuration: {
                    condition: {
                        data_types: [],
                        media_type: ''
                    },
                    data: {
                        input_data_name: 'input_file',
                        workspace_name: this.selectedWorkspace.name
                    }
                },
                is_active: true,
                name: `${this.selectedJobTypeDetail.manifest.job.name}-${this.selectedJobTypeDetail.manifest.job.jobVersion}-trigger`,
                type: 'INGEST'
            }
        };
        this.isScanning = true;
        this.scanProgress = 33;
        this.scanBtnIcon = 'fa fa-spinner fa-spin';
        this.jobTypesApiService.scanJobTypeWorkspace(scanObj).subscribe(() => {
            const rand = Math.floor(Math.random() * 1000000000);
            const scan = {
                name: `my-scan-process-${rand}`,
                title: 'My Scan Process',
                description: 'This is my Scan',
                configuration: {
                    version: '1.0',
                    workspace: this.selectedWorkspace.name,
                    scanner: {
                        type: 's3',
                    },
                    recursive: true,
                    files_to_ingest: [{
                        filename_regex: '.*'
                    }]
                }
            };
            this.scanProgress = 66;
            this.scansApiService.createScan(scan).subscribe(scanResult => {
                // then use the id that comes back from the above request and do a process scan
                this.scansApiService.processScan(scanResult.id).subscribe(() => {
                    this.scanProgress = 0;
                    this.scanDisplay = false; // hide scan dialog
                    this.isScanning = false; // done scanning
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Scan Process',
                        detail: 'Scan process has been successfully launched'
                    });
                });
            }, err => {
                this.handleScanError(err);
            });
        }, err => {
            this.handleScanError(err);
        });
    }
    createNewJobType() {
        this.router.navigate(['/configuration/job-types/create']);
    }
    toggleFavorite(e, name?: string, version?: string) {
        e.stopPropagation();
        if (!this.selectedJobTypeDetail) {
            const jobType: any = _.find(this.jobTypes, { value: { name: name, version: version } });
            if (jobType) {
                this.dashboardJobsService.toggleFavorite(jobType.value);
                this.isFavorite = this.dashboardJobsService.isFavorite(jobType.value);
                this.setFavoriteIcon(jobType.value);
            }
        } else {
            this.dashboardJobsService.toggleFavorite(this.selectedJobTypeDetail);
            this.isFavorite = this.dashboardJobsService.isFavorite(this.selectedJobTypeDetail);
            this.setFavoriteIcon();
        }
    }
    ngOnInit() {
        this.options = {
            legend: false,
            cutoutPercentage: 40,
            plugins: {
                datalabels: false
            }
        };
        this.getWorkspaces();

        this.jobTypes = [];
        let name = null;
        let version = null;
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(params => {
                name = params.get('name');
                version = params.get('version');
                if (name && version) {
                    this.getJobTypeDetail(name, version);
                } else {
                    this.getJobTypes();
                }
            });
        }
    }
    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
