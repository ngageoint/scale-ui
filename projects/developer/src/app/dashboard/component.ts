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
    layout = {
        margin: {l: 0, r: 0, b: 0, t: 0},
        width: 275,
        height: 275,
        sunburstcolorway: [
            ColorService.RUNNING,
            ColorService.PENDING,
            ColorService.QUEUED
          ],
          xbgcolor: 'rgba(0,0,0,0)',
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
        this.options = {
            cutoutPercentage: 0,
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
                display: true,
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
        // this.unsubscribe();
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

                        const runningJobs = _.uniqBy(_.filter(favJobs, function (r) {
                            return r.status === 'RUNNING';
                        }), function (e) {
                                return e.id;
                            });
                        this.createSunburstChart(runningJobs, 'running');
                        const pendingJobs = _.uniqBy(_.filter(favJobs, function (r) {
                            return r.status === 'PENDING';
                        }), function (e) {
                                return e.id;
                            });
                        this.createSunburstChart(pendingJobs, 'pending');
                        const queuedJobs = _.uniqBy(_.filter(favJobs, function (r) {
                            return r.status === 'QUEUED';
                        }), function (e) {
                                return e.id;
                            });
                        this.createSunburstChart(queuedJobs, 'queued');
                    }
                });
        },  err => {
            this.loadingJobTypes = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type status', detail: err.statusText});
        });
    }

    createSunburstChart(data, type) {
        const labels = [];
        const values = [];
        let tempSysCount = 0;
        let tempUserCount = 0;
         _.forEach(data, job => {
             const index = _.findIndex(labels, function(o) { return o === job.job_type.title; });
             if ( index > 0) {
                 values[index] = values[index]++;
             } else {
                 labels.push(job.job_type.title);
                 values.push(1);
             }
             if ( job.job_type.is_system ) {
                tempSysCount++;
             } else {
                tempUserCount++;
             }
         });
        if (type === 'running') {
            this.systemCount.running = tempSysCount;
            this.userCount.running = tempUserCount;
        this.running = {
            labels: ['Running'],
            datasets: [
                {
                    data: values,
                    label: 'Data 2',
                    labels: labels,
                    backgroundColor: ColorService.RUNNING
                },
                // {
                //     data: [this.running_count],
                //     label: 'Data 1',
                //     labels: ['running'],
                //     backgroundColor : [ColorService.RUNNING]
                // }
            ],
        };
        } else if (type === 'pending') {
            this.systemCount.pending = tempSysCount;
            this.userCount.pending = tempUserCount;
            this.pending = {
                labels: ['Pending'],
                datasets: [
                    {
                        data: values,
                        label: 'Data 2',
                        labels: labels,
                        backgroundColor: ColorService.PENDING
                    },
                    // {
                    //     data: [this.pending_count],
                    //     label: 'Data 1',
                    //     labels: ['pending'],
                    //     backgroundColor: [ColorService.PENDING]
                    // }
                ],
            };
        } else if (type === 'queued') {
            this.systemCount.queued = tempSysCount;
            this.userCount.queued = tempUserCount;
            this.queued = {
                labels: ['Queued'],
                datasets: [
                    {
                        data: values,
                        label: 'Data 2',
                        labels: labels,
                        backgroundColor: ColorService.QUEUED
                    },
                    // {
                    //     data: [this.queued_count],
                    //     label: 'Data 1',
                    //     labels: ['queued'],
                    //     backgroundColor : [ColorService.QUEUED]
                    // }
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
