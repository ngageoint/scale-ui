import { Component, OnDestroy, OnInit, Input, Output, } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { JobsApiService } from '../processing/jobs/api.service';
import { JobTypesApiService } from '../configuration/job-types/api.service';
import { DashboardJobsService } from './jobs.service';
import { QueueApiService } from '../common/services/queue/api.service';
import { ColorService } from '../common/services/color.service';

@Component({
    selector: 'dev-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    started: any;
    ended: any;
    loadingJobTypes: boolean;
    columnsFavs: any[];
    columnsAll: any[];
    subscription: any;
    allJobTypes: any;
    allJobTypesTooltip: string;
    favoriteJobTypes: any[];
    favoriteJobTypesTooltip: string;
    pieChartOptions: any;
    totalAll: number;
    failedAll: number;
    errorDataAll: any;
    totalDataAll: any;
    totalFavs: number;
    failedFavs: number;
    dataFavs: any;
    running: any;
    pending: any;
    queued: any;
    dataFeedChartTitle: string;
    historyChartTitle: string;
    activityChartTitle: string;
    options: any;
    totalChartData: any;
    queueLoadData: any;
    graph: any;
    graphFav: any;
    layout = {
        margin: {l: 0, r: 0, b: 0, t: 0},
        width: 275,
        height: 275,
        sunburstcolorway: [
            ColorService.RUNNING,
            ColorService.PENDING,
            ColorService.QUEUED
          ]
    };
    dateRangeOptions = [
        { label: 'Last day', value: 24 },
        { label: 'Last 3 days', value: 24 * 3 },
        { label: 'Last week', value: 24 * 7 }
    ];

    constructor(
        private messageService: MessageService,
        private jobsApiService: JobsApiService,
        private jobTypesApiService: JobTypesApiService,
        private jobsService: DashboardJobsService,
        private queueApiService: QueueApiService
    ) {
        this.columnsFavs = [
            { field: 'title', header: 'Title', filterMatchMode: 'contains' }
        ];
        this.columnsAll = [
            { field: 'job_type.title', header: 'Title', filterMatchMode: 'contains' }
        ];
        this.allJobTypes = [];
        this.favoriteJobTypes = [];
    }
    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    ngOnInit() {
        this.refreshAllJobTypes();
        this.jobsService.favoritesUpdated.subscribe(() => {
            this.refreshAllJobTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
    private refreshAllJobTypes() {
        this.loadingJobTypes = true;
        this.unsubscribe();
        const params = {
            is_active: true
        };
        this.subscription = this.jobTypesApiService.getJobTypeStatus(true, params).subscribe(data => {
            this.allJobTypes = _.orderBy(data.results, ['job_type.title', 'job_type.version'], ['asc', 'asc']);
            this.jobsService.setAllJobs(this.allJobTypes);

            const favs = [];
            this.allJobTypes.forEach(jt => {
                if (this.jobsService.isFavorite(jt.job_type)) {
                    favs.push(jt);
                }
            });
            this.favoriteJobTypes = favs;
            this.loadingJobTypes = false;
            let chartParams = {};
                chartParams = {
                    is_active: true,
                    status: ['RUNNING', 'PENDING', 'QUEUED']
                };
                this.subscription = this.jobsApiService.getJobs(chartParams).subscribe(chartData => {
                    if (this.favoriteJobTypes) {
                        let favJobs = [];
                        _.forEach(this.favoriteJobTypes, favoriteJob => {
                            _.forEach(chartData.results, job => {
                                if (favoriteJob.job_type.id === job.job_type.id) {
                                    favJobs.push(job);
                                }
                            });
                        });
                        favJobs = _.uniqBy(favJobs, function (e) {
                            return e.id;
                          });
                        this.graphFav = this.createSunburstChart(favJobs);
                    }
                    this.graph = this.createSunburstChart(chartData.results);
                });
        },  err => {
            this.loadingJobTypes = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type status', detail: err.statusText});
        });
    }

    createSunburstChart(data) {
        const runningJobs = _.filter(data, function (r) {
            return r.status === 'RUNNING';
         });
         const pendingJobs = _.filter(data, function (r) {
             return r.status === 'PENDING';
          });
          const queuedJobs = _.filter(data, function (r) {
             return r.status === 'QUEUED';
          });

        //  this.getQueueData();
         const labels = [];
         const parents = [];
         const values = [];
         labels.push('Running');
         labels.push('Pending');
         labels.push('Queued');
         parents.push('');
         parents.push('');
         parents.push('');
        //  values.push(this.running);
        //  values.push(this.queued);
        //  values.push(this.pending);
         _.forEach(runningJobs, job => {
             const index = _.findIndex(labels, function(o) { return o === job.job_type.title; });
             if ( index > 0) {
                 values[index] = values[index]++;
             } else {
                 labels.push(job.job_type.title);
                 parents.push('Running');
                 values.push(1);
             }
         });
         _.forEach(pendingJobs, job => {
             const index = _.findIndex(labels, function(o) { return o === job.job_type.title; });
             if ( index > 0) {
                 values[index] = values[index]++;
             } else {
                 labels.push(job.job_type.title);
                 parents.push('Pending');
                 values.push(1);
             }
         });
         _.forEach(queuedJobs, job => {
            const index = _.findIndex(labels, function(o) { return o === job.job_type.title; });
            if ( index > 0) {
                values[index] = values[index]++;
            } else {
                labels.push(job.job_type.title);
                parents.push('Queued');
                values.push(1);
            }
        });
          const graph = {
            data: [{
                type: 'sunburst',
                labels: labels,
                parents: parents,
                // values: values,
                outsidetextfont: {size: 20, color: '#377eb8'},
                leaf: {opacity: 0.5},
                marker: {line: {width: 2}}
              }]
        };
        return graph;
    }

    getQueueData() {
        const params = {
            started: this.started,
            ended: this.ended,
        };
        this.subscription = this.queueApiService.getLoad(params, true).subscribe(data => {
            this.queueLoadData = data;
            this.running = 0;
            this.queued = 0;
            this.pending = 0;

            _.forEach(data.results, result => {
                this.running = result.running_count;
                this.queued = result.queued_count;
                this.pending = result.pending_count;
            });
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving queue load', detail: err.statusText});
        });
    }
    onTemporalFilterUpdate(data: {start: string, end: string}): void {
        this.started = data.start;
        this.ended = data.end;
        this.refreshAllJobTypes();
    }
}
