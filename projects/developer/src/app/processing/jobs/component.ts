import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { DataService } from '../../common/services/data.service';
import { JobsApiService } from './api.service';
import { Job } from './api.model';
import { JobsDatatable } from './datatable.model';
import { JobsDatatableService } from './datatable.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { JobExecution } from './execution.model';

@Component({
    selector: 'dev-jobs',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobsComponent implements OnInit, OnDestroy {
    @Input() jobs: any;
    @Input() isChild: boolean;
    @Input() datatableOptions: JobsDatatable;
    @Output() datatableChange: EventEmitter<JobsDatatable> = new EventEmitter<JobsDatatable>();

    dateFormat: string = environment.dateFormat;
    datatableLoading: boolean;
    columns: any[];
    jobTypes: any;
    jobTypeOptions: SelectItem[];
    selectedJob: Job;
    selectedJobType: any = [];
    selectedJobExe: JobExecution;
    selectedRows: any;
    logDisplay: boolean;
    statusValues: SelectItem[];
    selectedStatus: any = [];
    errorCategoryValues: SelectItem[];
    selectedErrorCategory: any = [];
    count: number;
    started: string;
    ended: string;
    isInitialized: boolean;
    subscription: any;

    constructor(
        private dataService: DataService,
        private jobsDatatableService: JobsDatatableService,
        private jobsApiService: JobsApiService,
        private jobTypesApiService: JobTypesApiService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.isInitialized = false;
        this.selectedRows = this.dataService.getSelectedJobRows();
        this.columns = [
            { field: 'job_type', header: 'Job Type' },
            { field: 'created', header: 'Created (Z)' },
            { field: 'last_modified', header: 'Last Modified (Z)' },
            { field: 'node.hostname', header: 'Node' },
            { field: 'duration', header: 'Duration' },
            { field: 'status', header: 'Status' },
            { field: 'error.category', header: 'Error Category' },
            { field: 'error.title', header: 'Error' },
            { field: 'id', header: 'Log' }
        ];
        this.statusValues = [{
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
        this.datatableLoading = true;
        this.unsubscribe();
        this.subscription = this.jobsApiService.getJobs(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            _.forEach(data.results, result => {
                const job = _.find(this.selectedRows, { data: { id: result.id } });
                result.selected =  !!job;
            });
            this.jobs = Job.transformer(data.results);
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving jobs', detail: err.statusText});
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });

        if (this.isChild) {
            // notify the parent that the datatable options (filtering/sorting/etc.) have changed
            this.datatableChange.emit(this.datatableOptions);
            this.datatableLoading = false;
        } else {
            // component is not a child, so update datatable options, querystring, and data
            this.jobsDatatableService.setJobsDatatableOptions(this.datatableOptions);
            this.router.navigate(['/processing/jobs'], {
                queryParams: this.datatableOptions as Params,
                replaceUrl: true
            });

            this.updateData();
        }
    }
    private getJobTypes() {
        this.selectedJobType = [];
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = data.results;
            const selectItems = [];
            _.forEach(this.jobTypes, jobType => {
                selectItems.push({
                    label: jobType.title + ' ' + jobType.latest_version,
                    value: jobType
                });
                if (
                    _.indexOf(this.datatableOptions.job_type_name, jobType.name) >= 0 &&
                    _.indexOf(this.datatableOptions.job_type_version, jobType.latest_version) >= 0
                ) {
                    this.selectedJobType.push(jobType);
                }
            });
            this.jobTypeOptions = _.orderBy(selectItems, 'label', 'asc');
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
        });
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
            if (e.sortField !== this.datatableOptions.sortField || e.sortOrder !== this.datatableOptions.sortOrder) {
                this.datatableOptions = Object.assign(this.datatableOptions, {
                    first: 0,
                    sortField: e.sortField,
                    sortOrder: e.sortOrder
                });
            }
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onJobTypeChange(e) {
        const name = _.map(e.value, 'name');
        const version = _.map(e.value, 'latest_version');
        this.datatableOptions.job_type_name = name.length > 0 ? name : null;
        this.datatableOptions.job_type_version = version.length > 0 ? version : null;
        this.updateOptions();
    }
    onStatusChange(e) {
        this.datatableOptions.status = e.value.length > 0 ? e.value : null;
        this.updateOptions();
    }
    onErrorCategoryChange(e) {
        this.datatableOptions.error_category = e.value.length > 0 ? e.value : null;
        this.updateOptions();
    }
    onRowSelect(e) {
        if (!_.find(this.selectedRows, { data: { id: e.data.id } })) {
            this.dataService.setSelectedJobRows(e);
        }
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/processing/jobs/${e.data.id}`);
        } else {
            this.router.navigate([`/processing/jobs/${e.data.id}`]);
        }
    }
    onStartSelect(e) {
        this.started = moment.utc(e, this.dateFormat).startOf('d').format(this.dateFormat);
    }
    onEndSelect(e) {
        this.ended = moment.utc(e, this.dateFormat).endOf('d').format(this.dateFormat);
    }
    onDateFilterApply() {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: moment.utc(this.started, this.dateFormat).toISOString(),
            ended: moment.utc(this.ended, this.dateFormat).toISOString()
        });
        this.updateOptions();
    }
    setDateFilterRange(unit: any, range: any) {
        this.started = moment.utc().subtract(range, unit).toISOString();
        this.ended = moment.utc().toISOString();
        this.onDateFilterApply();
    }
    cancelJob(job: Job) {
        const originalStatus = job.status;
        job.status = 'CANCEL';
        this.jobsApiService.updateJob(job.id, { status: 'CANCELED' })
            .subscribe(() => {
                job.status = 'CANCELED';
            }, err => {
                job.status = originalStatus;
                this.messageService.add({severity: 'error', summary: 'Error canceling job', detail: err.statusText});
            });
    }
    requeueJobs(jobsParams?) {
        if (!jobsParams) {
            jobsParams = {
                started: this.datatableOptions.started,
                ended: this.datatableOptions.ended,
                error_categories: this.datatableOptions.error_category ? [this.datatableOptions.error_category] : null,
                status: this.datatableOptions.status === 'CANCELED' || this.datatableOptions.status === 'FAILED' ?
                    this.datatableOptions.status :
                    null,
                job_type_names: this.datatableOptions.job_type_name ? [this.datatableOptions.job_type_name] : null
            };
            // remove null properties
            jobsParams = _.pickBy(jobsParams);
        }
        this.jobsApiService.requeueJobs(jobsParams)
            .subscribe(() => {
                this.updateData();
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error requeuing jobs', detail: err.statusText});
            });
    }
    showExeLog(id) {
        this.jobsApiService.getJob(id)
            .subscribe(data => {
                this.selectedJobExe = data.execution;
                this.logDisplay = true;
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error retrieving job details', detail: err.statusText});
            });
    }
    hideExeLog() {
        this.selectedJobExe = null;
    }
    onFilterClick(e) {
        e.stopPropagation();
    }
    requeueAllConfirm() {
        // query for canceled and failed jobs with current params to report an accurate requeue count
        const requeueParams = _.clone(this.datatableOptions);
        requeueParams.status = ['CANCELED', 'FAILED'];
        this.jobsApiService.getJobs(requeueParams)
            .subscribe(data => {
                this.confirmationService.confirm({
                    message: `This will requeue <span class="failed"><strong>${data.count}</strong></span> canceled and failed jobs.
                              Are you sure that you want to proceed?`,
                    header: 'Requeue All Jobs',
                    icon: 'fa fa-question-circle',
                    accept: () => {
                        this.requeueJobs();
                    },
                    reject: () => {
                        console.log('requeue rejected');
                    }
                });
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error retrieving jobs', detail: err.statusText});
            });
    }
    ngOnInit() {
        if (!this.datatableOptions) {
            this.datatableOptions = this.jobsDatatableService.getJobsDatatableOptions();
        }
        this.jobs = [];
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: params.first ? parseInt(params.first, 10) : 0,
                    rows: params.rows ? parseInt(params.rows, 10) : 10,
                    sortField: params.sortField ? params.sortField : 'last_modified',
                    sortOrder: params.sortOrder ? parseInt(params.sortOrder, 10) : -1,
                    started: params.started ? params.started : moment.utc().subtract(1, 'd').startOf('d').toISOString(),
                    ended: params.ended ? params.ended : moment.utc().endOf('d').toISOString(),
                    status: params.status ?
                        Array.isArray(params.status) ?
                            params.status :
                            [params.status]
                        : null,
                    job_id: params.job_id ? parseInt(params.job_id, 10) : null,
                    job_type_name: params.job_type_name ?
                        Array.isArray(params.job_type_name) ?
                            params.job_type_name :
                            [params.job_type_name]
                        : null,
                    job_type_version: params.job_type_version ?
                        Array.isArray(params.job_type_version) ?
                            params.job_type_version :
                            [params.job_type_version]
                        : null,
                    job_type_category: params.job_type_category || null,
                    batch_id: params.batch_id ? parseInt(params.batch_id, 10) : null,
                    error_category: params.error_category ?
                        Array.isArray(params.error_category) ?
                            params.error_category :
                            [params.error_category]
                        : null,
                    include_superseded: params.include_superseded || null
                };
            }
            this.selectedStatus = this.datatableOptions.status ?
                Array.isArray(this.datatableOptions.status) ?
                    this.datatableOptions.status :
                    [this.datatableOptions.status]
                : null;
            this.selectedErrorCategory = this.datatableOptions.error_category ?
                Array.isArray(this.datatableOptions.error_category) ?
                    this.datatableOptions.error_category :
                    [this.datatableOptions.error_category]
                : null;
            this.started = moment.utc(this.datatableOptions.started).format(this.dateFormat);
            this.ended = moment.utc(this.datatableOptions.ended).format(this.dateFormat);
            this.getJobTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
