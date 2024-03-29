import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { LazyLoadEvent } from 'primeng/api';
import * as _ from 'lodash';

import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { RunningJobsDatatable } from './datatable.model';
import { RunningJobsDatatableService } from './datatable.service';
import { RunningJob } from './api.model';
import { JobsDatatableService } from '../jobs/datatable.service';

@Component({
    selector: 'dev-running-jobs',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RunningJobsComponent implements OnInit, OnDestroy {
    readonly jobsURL = '/processing/jobs';

    datatableOptions: RunningJobsDatatable;
    datatableLoading: boolean;
    columns: any[];
    runningJobs: any;
    selectedJob: RunningJob;
    first: number;
    count: number;
    isInitialized: boolean;
    subscription: any;

    constructor(
        private messageService: MessageService,
        private runningJobsDatatableService: RunningJobsDatatableService,
        private jobTypesApiService: JobTypesApiService,
        private jobsDatatableService: JobsDatatableService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.columns = [
            { field: 'job_type.name', header: 'Job Type' },
            { field: 'count', header: 'Number of Jobs' },
            { field: 'longest_running_duration', header: 'Duration of Longest Running Job' }
        ];
        this.isInitialized = false;
        this.datatableOptions = this.runningJobsDatatableService.getRunningJobsDatatableOptions();
    }

    private updateData() {
        this.datatableLoading = true;
        this.unsubscribe();
        this.subscription = this.jobTypesApiService.getRunningJobs(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            this.runningJobs = RunningJob.transformer(data.results);
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving running jobs', detail: err.statusText});
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d: any) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        }) as RunningJobsDatatable;
        this.runningJobsDatatableService.setRunningJobsDatatableOptions(this.datatableOptions);

        this.router.navigate(['/processing/running-jobs'], {
            queryParams: this.datatableOptions as Params,
            replaceUrl: true
        });

        this.updateData();
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    paginate(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: e.first,
            rows: parseInt(e.rows, 10)
        });
        this.updateOptions();
    }
    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            this.datatableOptions = Object.assign(this.datatableOptions, {
                first: 0
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onRowSelect(e) {
        const jobsDatatableOptions = this.jobsDatatableService.getJobsDatatableOptions();
        this.jobsDatatableService.setJobsDatatableOptions(Object.assign(jobsDatatableOptions, {
            first: 0,
            status: 'RUNNING',
            job_type_name: e.data.job_type.name,
            job_type_version: e.data.job_type.version
        }));
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey || e.originalEvent.which === 2) {
            // ctrl-click the row, build the raw url from the query params
            const params = this.getJobsQueryParams(e.data.job_type);
            const queryString = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
            const url = `${this.jobsURL}?${queryString}`;
            window.open(url);
        } else {
            this.router.navigate(['/processing/jobs/']);
        }
    }
    /**
     * Get the query params needed for building links to the jobs page.
     * @param  jobType the job_type data
     * @return         object of parameters for building the query string
     */
    getJobsQueryParams(jobType: any): object {
        return {
            first: 0,
            status: 'RUNNING',
            job_type_name: jobType.name,
            job_type_version: jobType.version
        };
    }
    ngOnInit() {
        this.datatableLoading = true;
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: +params.first || 0,
                    rows: +params.rows || 10
                };
            } else {
                this.datatableOptions = this.runningJobsDatatableService.getRunningJobsDatatableOptions();
            }
            this.updateOptions();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
