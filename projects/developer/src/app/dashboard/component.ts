import { Component, OnDestroy, OnInit, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { JobsApiService } from '../processing/jobs/api.service';
import { JobTypesApiService } from '../configuration/job-types/api.service';
import { DashboardJobsService } from './jobs.service';
import { QueueApiService } from '../common/services/queue/api.service';
import { ColorService } from '../common/services/color.service';
import * as moment from 'moment';
import { environment } from '../../environments/environment';
import value from '*.json';

@Component({
    selector: 'dev-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    @Output() started: any;
    @Output() ended: any;
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
    graph: any;
    layout = {
        margin: {l: 0, r: 0, b: 0, t: 0},
        width: 300,
        height: 300,
        sunburstcolorway: [
            ColorService.RUNNING,   // system
            ColorService.QUEUED,  // algorithm
            ColorService.PENDING
          ]
    };

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
    //     this.pieChartOptions = {
    //         rotation: 0.5 * Math.PI, // start from bottom
    //         cutoutPercentage: 0,
    //         maintainAspectRatio: false,
    //         legend: {
    //             display: false,
    //         },
    //         plugins: {
    //             datalabels: false
    //         },
    //         elements: {
    //             arc: {
    //                 borderWidth: 0
    //             }
    //         },
    //         tooltips: {
    //             callbacks: {
    //               label: function(tooltipItem, data) {
    //                 const dataset = data.datasets[tooltipItem.datasetIndex];
    //               const index = tooltipItem.index;
    //               return dataset.labels[index] + ': ' + dataset.data[index];
    //             }
    //           }
    //         },
    // };
    }
    getUnicode(code) {
        return `&#x${code};`;
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

    private generateStats(jobData: any[]): any {
        const systemJobs = _.filter(jobData, (systJob) => {
            return systJob.job_type.is_system === true;
        });
        this.getQueueData();

        const systemJobCounts = _.flatten(_.map(systemJobs, 'job_counts'));
        const systemSysErrors = _.sum(_.map(_.filter(systemJobCounts, (jobCount) => {
            return jobCount.status === 'FAILED' && jobCount.category === 'SYSTEM';
        }), 'count'));
        const systemAlgErrors = _.sum(_.map(_.filter(systemJobCounts, (jobCount) => {
            return jobCount.status === 'FAILED' && jobCount.category === 'ALGORITHM';
        }), 'count'));
        const systemDataErrors = _.sum(_.map(_.filter(systemJobCounts, (jobCount) => {
            return jobCount.status === 'FAILED' && jobCount.category === 'DATA';
        }), 'count'));
        const systemJobCountsChart = _.sum(_.map(systemJobCounts, 'count'));
        const userJobs = _.filter(jobData, (systJob) => {
            return systJob.job_type.is_system === false ;
        });
        const userJobCounts = _.flatten(_.map(userJobs, 'job_counts'));
        const sysErrors = _.sum(_.map(_.filter(userJobCounts, (jobCount) => {
            return jobCount.status === 'FAILED' && jobCount.category === 'SYSTEM';
        }), 'count'));
        const algErrors = _.sum(_.map(_.filter(userJobCounts, (jobCount) => {
            return jobCount.status === 'FAILED' && jobCount.category === 'ALGORITHM';
        }), 'count'));
        const dataErrors = _.sum(_.map(_.filter(userJobCounts, (jobCount) => {
            return jobCount.status === 'FAILED' && jobCount.category === 'DATA';
        }), 'count'));
        const userJobCountsChart = _.sum(_.map(userJobCounts, 'count'));
        const allJobCounts = _.flatten(_.map(jobData, 'job_counts'));
        const total = _.sum(_.map(allJobCounts, 'count'));
        const failed = sysErrors + algErrors + dataErrors;
       this.totalChartData = {
            data: {
                labels: ['System System Errors', 'System Algroitm', 'System Data', 'User System', 'User Algorithm', 'User Data'],
                datasets: [{
                    data: [this.running, this.queued, this.pending],
                    borderColor: '#fff',
                    borderWidth: 1,
                    backgroundColor: [
                        ColorService.RUNNING,   // system
                        ColorService.QUEUED,  // algorithm
                        ColorService.PENDING,  // data,
                        // ColorService.RUNNING,   // system
                        // ColorService.QUEUED,  // algorithm
                        // ColorService.PENDING,  // data,
                    ],
                    labels: ['User Running', 'User Queued', 'User Pending'],
                }
                // , {
                //         data: [systemJobCountsChart, userJobCountsChart],
                //         borderColor: '#fff',
                //         borderWidth: 1,
                //         backgroundColor: [
                //             ColorService.RUNNING,
                //             ColorService.COMPLETED
                //         ],
                //         labels: ['System', 'User'],
                // }
            ]
                }
        };
            // const totalChartData = {
            //     labels: ['RUNNING', 'COMPLETED'],
            //     datasets: [{
            //             data: [systemJobs, runningJobs],
            //             borderColor: '#fff',
            //             borderWidth: 1,
            //             backgroundColor: [
            //                 ColorService.RUNNING,
            //                 ColorService.COMPLETED
            //             ]
            //     }]
            // };
        return {
            total: total,
            failed: failed,
            // errorChartData: errorChartData,
            totalChartData: this.totalChartData.data
        };
    }
    private refreshAllJobTypes() {
        this.loadingJobTypes = true;
        this.unsubscribe();
        const params = {
            is_active: true,
            status: ['RUNNING', 'PENDING', 'QUEUED']
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
            const totalJobStats = this.generateStats(data.results);
            this.totalAll = totalJobStats.total;
            this.failedAll = totalJobStats.failed;
            this.errorDataAll = totalJobStats.errorChartData;
            this.totalDataAll = totalJobStats.totalChartData;

            const favoriteJobStats = this.generateStats(this.favoriteJobTypes);
            this.totalFavs = favoriteJobStats.total;
            this.failedFavs = favoriteJobStats.failed;
            this.dataFavs = favoriteJobStats.chartData;
            this.allJobTypesTooltip = this.allJobTypes.length > 0 ?
                `${this.totalAll} Total` : null;
            this.favoriteJobTypesTooltip = this.favoriteJobTypes.length > 0 ?
                `${this.totalFavs} Total` : null;
        }, err => {
            this.loadingJobTypes = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type status', detail: err.statusText});
        });

        this.subscription = this.jobsApiService.getJobs(params).subscribe(data => {

            const runningJobs = _.filter(data.results, function (r) {
               return r.status === 'RUNNING';
            });
            const pendingJobs = _.filter(data.results, function (r) {
                return r.status === 'PENDING';
             });
             const queuedJobs = _.filter(data.results, function (r) {
                return r.status === 'QUEUED';
             });

            this.getQueueData();
            const labels = [];
            const parents = [];
            const values = [];
            labels.push('Running');
            labels.push('Queued');
            labels.push('Pending');
            parents.push('');
            parents.push('');
            parents.push('');
            values.push(this.running);
            values.push(this.queued);
            values.push(this.pending);
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

            this.graph = {
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
        });
    }

    onDateFilterApply(data: any) {
        // if (this.sub) {
        //     this.sub.unsubscribe();
        //     this.sub = null;
        // }
        // this.jobs = null;
        this.started = data.started;
        this.ended = data.ended;
        this.options = Object.assign(this.options, {
            first: 0,
            started: moment.utc(this.started, environment.dateFormat).toISOString(),
            ended: moment.utc(this.ended, environment.dateFormat).toISOString()
        });
    }
    getDateRangeSelected(data: any) {
        this.started = moment.utc().subtract(data.range, data.unit).toISOString();
        this.ended = moment.utc().toISOString();
        // this.datatableOptions = Object.assign(this.datatableOptions, {
        //     first: 0,
        //     started: this.started,
        //     ended: this.ended
        // });
        // if (this.loading) {
        //     this.datatableOptions.duration = moment.duration(data.range, data.unit).toISOString();
        // }
        // this.updateOptions();
    }
    onDateRangeSelected(data: any) {
        // if (this.sub) {
        //     this.sub.unsubscribe();
        //     this.sub = null;
        // }
        // this.sub = Observable.timer(0, 10000)
        //     .subscribe(() => {
        //         this.getDateRangeSelected(data);
        //     });
    }

    getQueueData() {
        const params = {
            started: moment.utc().subtract(1, 'h').toISOString(),
            ended: moment.utc().toISOString(),
        };
        this.subscription = this.queueApiService.getLoad(params, true).subscribe(data => {
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
}
