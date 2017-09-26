import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, Dialog, SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';

import { JobsApiService } from './api.service';
import { Job } from './api.model';
import { JobsDatatable } from './datatable.model';
import { JobsDatatableService } from './datatable.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { JobType } from '../../configuration/job-types/api.model';

@Component({
    selector: 'app-jobs',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobsComponent implements OnInit {
    @Input() jobs: Job[];
    @Input() isChild: boolean;
    @Output() datatableChange = new EventEmitter<boolean>();

    datatableOptions: JobsDatatable;
    jobTypes: JobType[];
    jobTypeOptions: SelectItem[];
    selectedJob: Job;
    selectedJobType: string;
    selectedJobForLog: Job;
    logDisplay: boolean;
    statusValues: SelectItem[];
    selectedStatus: string;
    errorCategoryValues: SelectItem[];
    selectedErrorCategory: string;
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private jobsDatatableService: JobsDatatableService,
        private jobsApiService: JobsApiService,
        private jobTypesApiService: JobTypesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.isInitialized = false;
        this.statusValues = [{
            label: 'View All',
            value: ''
        }, {
            label: 'Canceled',
            value: 'CANCELED'
        }, {
            label: 'Completed',
            value: 'COMPLETED'
        }, {
            label: 'Failed',
            value: 'FAILED'
        }, {
            label: 'Pending',
            value: 'PENDING'
        }, {
            label: 'Queued',
            value: 'QUEUED'
        }, {
            label: 'Running',
            value: 'RUNNING'
        }];
        this.errorCategoryValues = [{
            label: 'View All',
            value: ''
        }, {
            label: 'System',
            value: 'SYSTEM'
        }, {
            label: 'Algorithm',
            value: 'ALGORITHM'
        }, {
            label: 'Data',
            value: 'DATA'
        }];
    }

    private updateData() {
        this.jobsApiService.getJobs(this.datatableOptions).then(data => {
            this.count = data.count;
            this.jobs = Job.transformer(data.results);
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        this.jobsDatatableService.setJobsDatatableOptions(this.datatableOptions);

        if (this.isChild) {
            // notify the parent that the datatable options (filtering/sorting/etc.) have changed
            this.datatableChange.emit(true);
        } else {
            // component is not being referenced as a child, so update querystring and data
            this.router.navigate(['/processing/jobs'], {
                queryParams: this.datatableOptions,
                replaceUrl: true
            });

            this.updateData();
        }
    }
    private getJobTypes() {
        this.jobTypesApiService.getJobTypes().then(data => {
            this.jobTypes = data.results as JobType[];
            const selectItems = [];
            _.forEach(this.jobTypes, (jobType) => {
                selectItems.push({
                    label: jobType.title + ' ' + jobType.version,
                    value: jobType.name
                });
                if (this.datatableOptions.job_type_name === jobType.name) {
                    this.selectedJobType = jobType.name;
                }
            });
            this.jobTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
            this.jobTypeOptions.unshift({
                label: 'View All',
                value: ''
            });
            this.updateOptions();
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
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
                first: 0,
                sortField: e.sortField,
                sortOrder: e.sortOrder
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onJobTypeChange(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            job_type_name: e.value
        });
        this.updateOptions();
    }
    onStatusChange(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            status: e.value
        });
        this.updateOptions();
    }
    onErrorCategoryChange(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            error_category: e.value
        });
        this.updateOptions();
    }
    onRowSelect(e) {
        this.router.navigate(['/processing/jobs/' + e.data.id]);
    }
    cancelJob(job: Job) {
        const originalStatus = job.status;
        job.status = 'CANCEL';
        this.jobsApiService.updateJob(job.id, { status: 'CANCELED' }).then(() => {
            job.status = 'CANCELED';
        }, function (err) {
            console.log(err);
            job.status = originalStatus;
        });
    }
    requeueJobs(jobsParams) {
        if (!jobsParams) {
            jobsParams = _.clone(this.datatableOptions);
        }
        this.jobsApiService.requeueJobs(jobsParams).then(() => {
            this.updateData();
        }, (err) => {
            console.log(err);
        });
    }
    showLog(job: Job) {
        this.logDisplay = true;
        this.selectedJobForLog = job;
    }
    ngOnInit() {
        this.jobs = [];
        if (this.route.snapshot &&
            Object.keys(this.route.snapshot.queryParams).length > 0) {

            const params = this.route.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                started: params.started,
                ended: params.ended,
                status: params.status,
                job_id: params.job_id,
                job_type_id: params.job_type_id,
                job_type_name: params.job_type_name,
                job_type_category: params.job_type_category,
                batch_id: params.batch_id,
                error_category: params.error_category,
                include_superseded: params.include_superseded
            };
        } else {
            this.datatableOptions = this.jobsDatatableService.getJobsDatatableOptions();
        }
        this.selectedStatus = this.datatableOptions.status;
        this.selectedErrorCategory = this.datatableOptions.error_category;
        this.getJobTypes();
    }
}
