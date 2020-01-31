import { Component, OnDestroy, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';

import { DashboardJobsService } from '../jobs.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';

@Component({
    selector: 'dev-job-activity',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobActivityComponent implements OnInit, OnDestroy, OnChanges {
    @Input() favorites = [];
    @Input() started;
    @Input() ended;
    chartLoading: boolean;
    jobTypes: any;
    params: any;
    subscription: any;
    allJobs = [];
    constructor(
        private messageService: MessageService,
        private jobsService: DashboardJobsService,
        private jobTypesApiService: JobTypesApiService
    ) {}

    private updateData() {
        this.allJobs = this.jobsService.getAllJobs();
        // only show active job types in the load chart
        let activeJobTypes = [];
        if (this.favorites.length > 0) {
            activeJobTypes = _.filter(this.favorites, d => {
                const jobType = _.find(this.jobTypes, { name: d.job_type.name, version: d.job_type.version });
                return typeof jobType !== 'undefined';
            });
        } else {
            activeJobTypes = _.filter(this.allJobs, d => {
                const jobType = _.find(this.jobTypes, { name: d.name, version: d.version });
                return typeof jobType !== 'undefined';
            });
        }
        this.params = {
            started: this.started,
            ended: this.ended,
            job_type_id: _.map(activeJobTypes, 'job_type.id')
        };
        this.chartLoading = false;
    }

    private unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onChartLoaded(data) {
        data.chart.canvas.parentNode.style.height = '360px';
    }

    ngOnInit() {
        this.chartLoading = true;
        this.jobTypesApiService.getJobTypes().subscribe((data: any) => {
            this.jobTypes = data.results;
            this.updateData();
            this.subscription = this.jobsService.favoritesUpdated.subscribe(() => {
                this.updateData();
            });
        }, err => {
            console.log(err);
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.updateData();
    }
}
