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
    favoriteJobTypes: any[];
    dataFavs: any;
    options: any;

    dateRangeOptions = [
        { label: 'Last day', value: 24 },
        { label: 'Last week', value: 24 * 7 }
    ];

    constructor(
        private messageService: MessageService,
        private jobsApiService: JobsApiService,
        private jobTypesApiService: JobTypesApiService,
        private jobsService: DashboardJobsService,
    ) {
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
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
                display: false,
                
                labels: {
                    // fillStyle: [this.colorService.SCALE_PRIMARY, ColorService.SCALE_DARK, ColorService.RUNNING],
                    // text: ['System', 'User', 'Running'],
                    // fontColor: 'rgb(255, 99, 132)'
                },
            },
            rotation: 0.5 * Math.PI, // start from bottom
            elements: {
                inner: {
                    borderWidth: 4
                }
            },
            plugins: {
                datalabels: {
                    font: {
                        family: 'FontAwesome',
                        weight: 'bold'
                    },
                    formatter: function(value, ctx) {
                        if ( ctx.dataset.label === 'Outer Ring') {
                            return String.fromCharCode(parseInt(ctx.dataset.icon[ctx.dataIndex], 16));
                        } else {
                            if ( value > 0) {
                                return value;
                            } else {
                                return null;
                            }
                        }
                    },
                    align: 'center',
                    anchor: 'center',
                    textAlign: 'center',
                    color: 'white',
                }
            },
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
                    status: ['RUNNING']
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
        const labels = [];
        const values = [];
        const iconList = [];
        let tempSysCount = 0;
        let tempUserCount = 0;

        _.forEach(data, job => {
            const index = _.findIndex(labels, function(o) { return o === job.job_type.title; });
            if (index >= 0) {
                values[index] = (values[index]) + 1;
            } else {
                labels.push(job.job_type.title);
                values.push(1);
                iconList.push(job.job_type.icon_code);
            }
        });


        _.forEach(data, job => {
            if (job.job_type.is_system) {
                tempSysCount++;
            } else {
                tempUserCount++;
            }
        });

        if (type === 'fav') {
        this.dataFavs = {
            labels: ['System', 'User', 'Running'],
            borderWidth: 30,
            datasets: [
                {
                    data: values,
                    label: 'Outer Ring',
                    labels: labels,
                    icon: iconList,
                    backgroundColor: ColorService.RUNNING
                },
                {
                    data: [tempSysCount, tempUserCount],
                    label: 'Inner Ring',
                    labels: ['System', 'User'],
                    icon: null,
                    backgroundColor: ['#074d75', '#4593bf']
                },
            ],
        };
        } else if (type === 'all') {
            this.data = {
                labels: ['system', 'user', 'running'],
                datasets: [
                    {
                        data: values,
                        label: 'Outer Ring',
                        labels: labels,
                        icon: iconList,
                        backgroundColor: ColorService.RUNNING
                    },
                    {
                        data: [tempSysCount, tempUserCount],
                        label: 'Inner Ring',
                        labels: ['System', 'User'],
                        icon: null,
                        backgroundColor: ['#074d75', '#4593bf']
                    }
                ],
            };
        }
    }

    changeTab() {
        this.refreshAllJobTypes();
    }

    onTemporalFilterUpdate(data: {start: string, end: string}): void {
        this.started = data.start;
        this.ended = data.end;
        this.refreshAllJobTypes();
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

    // getQueueData() {
    //     const params = {
    //         started: moment.utc().subtract(1, 'h').toISOString(),
    //         ended: moment.utc().toISOString(),
    //     };
    //     this.subscription = this.queueApiService.getLoad(params, true).subscribe(data => {
    //         this.running = 0;
    //         this.queued = 0;
    //         this.pending = 0;

    //         _.forEach(data.results, result => {
    //             this.running = result.running_count;
    //             this.queued = result.queued_count;
    //             this.pending = result.pending_count;
    //         });
    //     }, err => {
    //         this.messageService.add({severity: 'error', summary: 'Error retrieving queue load', detail: err.statusText});
    //     });
    // }
    onTemporalFilterUpdate(data: {start: string, end: string}): void {
        this.started = data.start;
        this.ended = data.end;
        this.refreshAllJobTypes();
    }
}
