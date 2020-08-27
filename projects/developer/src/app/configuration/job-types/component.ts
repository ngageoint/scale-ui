import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, SelectItem, MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import webkitLineClamp from 'webkit-line-clamp';
import * as _ from 'lodash';

import { JobTypesApiService } from './api.service';
import { ColorService } from '../../common/services/color.service';
import { DashboardJobsService } from '../../dashboard/jobs.service';

@Component({
    selector: 'dev-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobTypesComponent implements OnInit, OnDestroy {
    @ViewChild('dv', {static: true}) dv: any;
    private routeParams: any;
    private itemsWithPause: MenuItem[] = [
        { label: 'View jobs', icon: 'fa fa-eye', command: () => { this.onJobsViewClick(); } },
        { label: 'Pause', icon: 'fa fa-pause', command: () => { this.onPauseClick(); } },
        { label: 'Edit', icon: 'fa fa-edit', command: () => { this.onEditClick(); } },
        { label: 'Favorite', icon: 'fa fa-star-o', command: ($event) => { this.toggleFavorite($event.originalEvent); } },
        { label: 'Deprecate', icon: 'fa fa-circle-o', command: () => { this.onDeprecateClick(); } }
    ];
    private itemsWithResume: MenuItem[] = [
        { label: 'View jobs', icon: 'fa fa-eye', command: () => { this.onJobsViewClick(); } },
        { label: 'Resume', icon: 'fa fa-play', command: () => { this.onPauseClick(); } },
        { label: 'Edit', icon: 'fa fa-edit', command: () => { this.onEditClick(); } },
        { label: 'Favorite', icon: 'fa fa-star-o', command: ($event) => { this.toggleFavorite($event.originalEvent); } },
        { label: 'Deprecate', icon: 'fa fa-circle-o', command: () => { this.onDeprecateClick(); } }
    ];
    private itemsWithActivate: MenuItem[] = [
        { label: 'Activate', icon: 'fa fa-circle', command: () => { this.onDeprecateClick(); } }
    ];
    isFavorite: any;
    rows = 16;
    jobTypes: SelectItem[];
    totalRecords: number;
    selectedJobTypeDetail: any;
    options: any;
    items: MenuItem[];
    workspaces: SelectItem[] = [];
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
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private jobTypesApiService: JobTypesApiService,
        private colorService: ColorService,
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
    private updateIsActive() {
        this.selectedJobTypeDetail.is_active = !this.selectedJobTypeDetail.is_active;
        this.jobTypesApiService.updateJobType(this.selectedJobTypeDetail).subscribe(() => {
            this.items = this.selectedJobTypeDetail.is_active ? _.clone(this.itemsWithPause) : _.clone(this.itemsWithActivate);
            this.messageService.add({ severity: 'success', summary: 'Job type updated' });
        }, err => {
            console.log(err);
            this.messageService.add({ severity: 'error', summary: 'Error deprecating job type', detail: err.statusText });
            this.selectedJobTypeDetail.is_active = !this.selectedJobTypeDetail.is_active;
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onJobTypeClick(e, jobType) {
        if (e.ctrlKey || e.metaKey) {
            window.open(this.getJobTypeURL(jobType.value));
        } else {
            this.router.navigate([this.getJobTypeURL(jobType.value)]);
        }
    }
    /**
     * Get the router link to the job types page.
     * @param  jobType a job type object containing a name and version
     * @return         the link to the job types page
     */
    getJobTypeURL(jobType: any): string {
        return `/configuration/job-types/${jobType.name}/${jobType.version}`;
    }

    /**
     * Click handler in action dropdown of details view for navigating to filtered jobs table.
     */
    onJobsViewClick(): void {
        this.router.navigate(['/processing/jobs'], {
            queryParams: {
                job_type_name: this.selectedJobTypeDetail.name,
                job_type_version: this.selectedJobTypeDetail.version
            }
        });
    }

    onPauseClick() {
        const action = this.selectedJobTypeDetail.is_paused ? 'Resume' : 'Pause';
        let message = `${action} ${this.selectedJobTypeDetail.title} v${this.selectedJobTypeDetail.version}?`;
        message = this.selectedJobTypeDetail.is_system && action === 'Pause' ?
            `${message}<br /><br />WARNING: This is a system job. Pausing could negatively affect Scale.` :
            message;
        this.confirmationService.confirm({
            key: 'jobTypeConfirm',
            message: message,
            accept: () => {
                this.jobTypesApiService.validateJobType(this.selectedJobTypeDetail).subscribe(result => {
                    if (!result.is_valid) {
                        _.forEach(result.warnings, warning => {
                            this.messageService.add({ severity: 'warn', summary: warning.name, detail: warning.description, sticky: true });
                        });
                        _.forEach(result.errors, error => {
                            this.messageService.add({ severity: 'error', summary: error.name, detail: error.description, sticky: true });
                        });
                    } else {
                        this.selectedJobTypeDetail.is_paused = !this.selectedJobTypeDetail.is_paused;
                        this.jobTypesApiService.updateJobType(this.selectedJobTypeDetail).subscribe(() => {
                            this.items = this.selectedJobTypeDetail.is_paused ?
                                _.clone(this.itemsWithResume) :
                                _.clone(this.itemsWithPause);
                            this.messageService.add({ severity: 'success', summary: 'Job type updated' });
                        }, err => {
                            this.messageService.add({severity: 'error', summary: 'Error updating job type', detail: err.statusText});
                        });
                    }
                }, err => {
                    console.log(err);
                    this.messageService.add({ severity: 'error', summary: 'Error validating job type', detail: err.statusText });
                });
            }
        });
    }
    onEditClick() {
        this.router.navigate([`/configuration/job-types/edit/${this.selectedJobTypeDetail.name}/${this.selectedJobTypeDetail.version}`]);
    }
    onDeprecateClick() {
        if (this.selectedJobTypeDetail.is_active) {
            this.confirmationService.confirm({
                key: 'jobTypeConfirm',
                message: `Deprecate ${this.selectedJobTypeDetail.title} v${this.selectedJobTypeDetail.version}?`,
                accept: () => {
                    this.updateIsActive();
                }
            });
        } else {
            this.updateIsActive();
        }
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
