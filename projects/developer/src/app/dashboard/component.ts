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
    data: any;
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
    running_count: any;
    pending_count: any;
    queued_count: any;
    dataFeedChartTitle: string;
    historyChartTitle: string;
    activityChartTitle: string;
    options: any;
    totalChartData: any;
    queueLoadData: any;
    systemCount = {
        running: 0,
        pending: 0,
        queued: 0
    };
    userCount = {
        running: 0,
        pending: 0,
        queued: 0
    };
    graph: any;
    graphFav: any;

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
        this.options = {
            cutoutPercentage: 0,
            borderWidth: 15,
            tooltips: {
                callbacks: {
                    label: function (item, data) {
                        const label = data.datasets[item.datasetIndex].labels[item.index];
                        const value = data.datasets[item.datasetIndex].data[item.index];
                        return label + ': ' + value;
                    }
                }
            },
            legend: {
                display: false,
                onClick: {

                 }
            }
        };
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
        this.getQueueData();
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
                        const favJobs = [];
                        _.forEach(this.favoriteJobTypes, favoriteJob => {
                            _.forEach(chartData.results, job => {
                                if (favoriteJob.job_type.id === job.job_type.id) {
                                    favJobs.push(job);
                                }
                            });
                        });
                        this.createSunburstChart(favJobs, 'fav');
                    }
                    this.createSunburstChart(chartData.results, 'all');
                });
        },  err => {
            this.loadingJobTypes = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type status', detail: err.statusText});
        });
    }

    createSunburstChart(data, type) {
        const pendingLabels = [];
        const runningLabels = [];
        const queuedLabels = [];
        const pendingValues = [];
        const runningValues = [];
        const queuedValues = [];
        const colors = [];
        let tempSysCount = 0;
        let tempUserCount = 0;

        const pendingJobs = _.filter(data, function (r) {
            return r.status === 'PENDING';
        });
        const runningJobs = _.filter(data, function (r) {
            return r.status === 'RUNNING';
        });
        const queuedJobs = _.filter(data, function (r) {
            return r.status === 'QUEUED';
        });


        _.forEach(pendingJobs, job => {
            const index = _.findIndex(pendingLabels, function(o) { return o === job.job_type.title; });
            if ( index >= 0) {
                pendingValues[index] = (pendingValues[index]) + 1;
            } else {
                pendingLabels.push(job.job_type.title);
                pendingValues.push(1);
                colors.push(ColorService.PENDING);
            }
        });
        _.forEach(runningJobs, job => {
            // const index = _.findIndex(labels, function(o) { return o === job.job_type.title; });
            const index = _.findIndex(runningLabels, function(o) { return o === job.job_type.title; });
            if (index >= 0) {
                runningValues[index] = (runningValues[index]) + 1;
            } else {
                runningLabels.push(job.job_type.title);
                runningValues.push(1);
                colors.push(ColorService.RUNNING);
            }
        });
        _.forEach(queuedJobs, job => {
            const queuedIndex = _.findIndex(queuedLabels, function(o) { return o === job.job_type.title; });
            if ( queuedIndex >= 0) {
                queuedValues[queuedIndex] = (queuedValues[queuedIndex]) + 1;
            } else {
                queuedLabels.push(job.job_type.title);
                queuedValues.push(1);
                colors.push(ColorService.QUEUED);
            }
        });
        const labels = _.concat(pendingLabels, runningLabels, queuedLabels);
        const values = _.concat(pendingValues, runningValues, queuedValues);
        // console.log(labels)
        _.forEach(data, job => {
            if ( job.job_type.is_system ) {
            tempSysCount++;
            } else {
            tempUserCount++;
            }
        });
        if (type === 'fav') {
            this.systemCount.running = tempSysCount;
            this.userCount.running = tempUserCount;
        this.running = {
            labels: ['system', 'user', 'running', 'pending', 'queued'],
            borderWidth: 30,
            datasets: [
                {
                    data: values,
                    label: 'Data 2',
                    labels: labels,
                    backgroundColor: colors
                },
                {
                    data: [this.systemCount.running, this.userCount.running],
                    label: 'Data 1',
                    labels: ['System', 'User'],
                    backgroundColor: [ColorService.SCALE_BLUE1, ColorService.SCALE_BLUE2]
                },
            ],
        };
        } else if (type === 'all') {
            this.systemCount.pending = tempSysCount;
            this.userCount.pending = tempUserCount;
            this.pending = {
                labels: ['Pending'],
                datasets: [
                    {
                        data: values,
                        label: 'Data 2',
                        labels: labels,
                        backgroundColor: colors
                    },
                    {
                        data: [this.systemCount.running, this.userCount.running],
                        label: 'Data 1',
                        labels: ['System', 'User'],
                        backgroundColor: [ColorService.SCALE_BLUE1, ColorService.SCALE_BLUE2]
                    }
                ],
            };
        }
    }

    getQueueData() {
        const params = {
            started: this.started,
            ended: this.ended,
        };
        this.subscription = this.queueApiService.getLoad(params, true).subscribe(data => {
            this.running_count = 0;
            this.queued_count = 0;
            this.pending_count = 0;
            const lastValue = data.results.length - 1;
            const lastHour = data.results[lastValue];

            this.running_count = lastHour.running_count;
            this.queued_count = lastHour.queued_count;
            this.pending_count = lastHour.pending_count;
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
