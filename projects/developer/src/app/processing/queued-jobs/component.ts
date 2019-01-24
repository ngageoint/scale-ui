import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { LazyLoadEvent } from 'primeng/primeng';
import * as _ from 'lodash';

import { QueueApiService } from '../../common/services/queue/api.service';
import { QueuedJob } from './api.model';

@Component({
    selector: 'dev-queued-jobs',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class QueuedJobsComponent implements OnInit, OnDestroy {
    datatableLoading: boolean;
    jobBreakdown: string;
    columns: any[];
    queuedJobs: any;
    selectedJob: QueuedJob;
    first: number;
    count: number;
    isInitialized: boolean;
    subscription: any;

    constructor(
        private messageService: MessageService,
        private queueApiService: QueueApiService,
        private router: Router
    ) {
        this.columns = [
            { field: 'job_type.name', header: 'Job Type' },
            { field: 'job_type.version', header: 'Version' },
            { field: 'highest_priority', header: 'Highest Priority' },
            { field: 'count', header: 'Count' },
            { field: 'longest_queued_duration', header: 'Duration of Longest Queued Job' }
        ];
        this.isInitialized = false;
    }

    private updateData() {
        this.datatableLoading = true;
        this.unsubscribe();
        this.subscription = this.queueApiService.getQueueStatus(true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            this.queuedJobs = QueuedJob.transformer(data.results);
            const totalQueued = _.sumBy(this.queuedJobs, 'count');
            const totalQueuedText = totalQueued === 1 ? 'job' : 'jobs';
            const countText = this.count === 1 ? 'job type' : 'job types';
            this.jobBreakdown = `(${this.count} ${countText}, ${totalQueued} ${totalQueuedText})`;
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving queued jobs', detail: err.statusText});
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
    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            this.updateData();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onRowSelect(e) {
        const jobsDatatableOptions = this.jobsDatatableService.getJobsDatatableOptions();
        this.jobsDatatableService.setJobsDatatableOptions(Object.assign(jobsDatatableOptions, {
            first: 0,
            status: 'QUEUED',
            job_type_name: this.selectedJob.job_type.name,
            job_type_version: this.selectedJob.job_type.version
        }));
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/processing/jobs/?first=0&status=QUEUED&job_type_name=${this.selectedJob.job_type.name}&job_type_version=${this.selectedJob.job_type.version}`);
        } else {
            this.router.navigate(['/processing/jobs/']);
        }
    }
    ngOnInit() {
        this.datatableLoading = true;
        this.updateData();
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
