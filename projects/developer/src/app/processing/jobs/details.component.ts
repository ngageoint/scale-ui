import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { Job } from './api.model';
import { JobExecution } from './execution.model';
import { JobsApiService } from './api.service';
import { DataService } from '../../common/services/data.service';

@Component({
    selector: 'dev-job-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class JobDetailsComponent implements OnInit, OnDestroy {
    subscription: any;
    job: Job;
    loading: boolean;
    loadingInputs: boolean;
    loadingOutputs: boolean;
    loadingExecutions: boolean;
    jobInputs = [];
    jobOutputs = [];
    jobExecutions: any;
    jobStatus: string;
    exeStatus: string;
    options: any;
    data: any;
    hasActiveJobExe: boolean;
    canRequeue: boolean;
    selectedJobExe: any;
    logDisplay: boolean;
    inputClass = 'p-col-12';
    outputClass = 'p-col-12';

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private jobsApiService: JobsApiService
    ) {}

    private initJobDetail(data) {
        this.job = data;
        if (this.selectedJobExe && this.job.execution.id === this.selectedJobExe.id) {
            this.selectedJobExe = _.clone(this.job.execution);
        }

        if (data.notRetriedTooltip) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Job not retriable',
                detail: data.notRetriedTooltip,
                closable: true,
            });
        }

        const now = moment.utc();
        const lastStatus = this.job.last_status_change ? moment.utc(this.job.last_status_change) : null;
        this.jobStatus = lastStatus ? `${_.capitalize(this.job.status)} ${lastStatus.from(now)}` : _.capitalize(this.job.status);
        this.exeStatus = this.job.execution && this.job.execution.ended ?
            `${_.toLower(this.job.execution.status)} ${moment.utc(this.job.execution.last_modified).from(now)}` :
            this.job.execution && this.job.execution.status ?
                `${_.toLower(this.job.execution.status)}` :
                'status unavailable';
        this.options = {
            elements: {
                font: 'Roboto',
                colorFunction: () => {
                    return Color('#017cce');
                }
            },
            scales: {
                xAxes: [{
                    type: 'timeline',
                    bounds: 'ticks',
                    ticks: {
                        callback: (value, index, values) => {
                            if (!values[index]) {
                                return;
                            }
                            return moment.utc(values[index]['value']).format('HH:mm:ss[Z]');
                        }
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, chartData) => {
                        const d = chartData.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        return [
                            d[2],
                            moment.utc(d[0]).format('YYYY-MM-DD HH:mm:ss[Z]'),
                            moment.utc(d[1]).format('YYYY-MM-DD HH:mm:ss[Z]')
                        ];
                    }
                }
            },
            plugins: {
                datalabels: false,
                timeline: true
            },
            maintainAspectRatio: false
        };
        this.data = {
            labels: ['Created', 'Queued', 'Executed'],
            datasets: [{
                data: [
                    [data.created, data.queued, DataService.calculateDuration(data.created, data.queued, true)]
                ]
            }, {
                data: [
                    [data.queued, data.started, DataService.calculateDuration(data.queued, data.started, true)]
                ]
            }, {
                data: [
                    [data.started, data.ended, DataService.calculateDuration(data.started, data.ended, true)]
                ]
            }]
        };
    }

    private getJobDetail(id: number) {
        this.loading = true;
        this.subscription = this.jobsApiService.getJob(id, true).subscribe(data => {
            this.loading = false;
            this.initJobDetail(data);

            // get job inputs
            this.loadingInputs = true;
            this.jobsApiService.getJobInputs(id)
                .subscribe(inputData => {
                    this.loadingInputs = false;
                    _.forEach(inputData.results, d => {
                        d.createdTooltip = DataService.formatDate(d.created);
                        d.createdDisplay = DataService.formatDate(d.created, true);
                        d.lastModifiedTooltip = DataService.formatDate(d.last_modified);
                        d.lastModifiedDisplay = DataService.formatDate(d.last_modified, true);
                    });
                    this.jobInputs = inputData.results;
                    this.inputClass = this.jobInputs.length > 0 && _.keys(data.input.json).length > 0 ? 'p-col-6' : 'p-col-12';
                }, err => {
                    this.loadingInputs = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job inputs', detail: err.statusText});
                });

            // get job outputs
            this.loadingOutputs = true;
            this.jobsApiService.getJobOutputs(id)
                .subscribe(outputData => {
                    this.loadingOutputs = false;
                    _.forEach(outputData.results, d => {
                        d.createdTooltip = DataService.formatDate(d.created);
                        d.createdDisplay = DataService.formatDate(d.created, true);
                        d.lastModifiedTooltip = DataService.formatDate(d.last_modified);
                        d.lastModifiedDisplay = DataService.formatDate(d.last_modified, true);
                    });
                    this.jobOutputs = outputData.results;
                    this.outputClass = this.jobOutputs.length > 0 && _.keys(data.output.json).length > 0 ? 'p-col-6' : 'p-col-12';
                }, err => {
                    this.loadingOutputs = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job outputs', detail: err.statusText});
                });

            // get job executions
            this.loadingExecutions = true;
            this.hasActiveJobExe = false;
            this.jobsApiService.getJobExecutions(id)
                .subscribe(exeData => {
                    this.loadingExecutions = false;
                    this.jobExecutions = JobExecution.transformer(exeData.results);
                    // Order the job-exes by created so index [0] will be the latest.
                    this.jobExecutions.sort(function(a, b) {
                        return a.created - b.created;
                    });
                    // If a job_exe is currently in these states we will let the user cancel them
                    for (const i of this.jobExecutions) {
                        if (['RUNNING', 'QUEUED', 'PENDING'].includes(i.status)) {
                            this.hasActiveJobExe = true;
                        }

                        // If the most recent job_exe is able to be requeued
                        if (['FAILED', 'CANCELED'].includes(this.jobExecutions[0].status)) {
                            this.canRequeue = true;
                        }
                    }
                }, err => {
                    this.loadingExecutions = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job executions', detail: err.statusText});
                });
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving job details', detail: err.statusText});
            });
    }

    calculateFileSize(fileSize) {
        return DataService.calculateFileSizeFromBytes(fileSize, 0);
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    requeueJob(e) {
        this.messageService.add({severity: 'success', summary: 'Job requeue has been requested'});

        const jobsParams = {
            job_type_names: [this.job.job_type.name],
            job_ids: [this.job.id],
            status: this.jobExecutions[0].status
        };

        this.jobsApiService.requeueJobs(jobsParams)
            .subscribe(() => {
                this.getJobDetail(this.job.id);
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error requeuing jobs', detail: err.statusText});
            });
    }

    cancelJob(e) {
        this.messageService.add({severity: 'success', summary: 'Job cancellation has been requested'});

        const jobsParams = {
            job_type_names: [this.job.job_type.name],
            job_ids: [this.job.id]
        };

        this.jobsApiService.cancelJobs(jobsParams)
            .subscribe(() => {
                this.getJobDetail(this.job.id);
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error canceling jobs', detail: err.statusText});
            });
        }

    showExeLog(event, exe) {
        this.selectedJobExe = exe;
        this.logDisplay = true;
    }

    hideExeLog() {
        this.selectedJobExe = null;
    }

    showStatus(statusPanel, $event) {
        statusPanel.show($event);
    }

    hideStatus(statusPanel) {
        statusPanel.hide();
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        if (this.route.snapshot) {
            const id = +this.route.snapshot.paramMap.get('id');
            this.getJobDetail(id);
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
