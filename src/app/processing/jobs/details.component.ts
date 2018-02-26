import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { Job } from './api.model';
import { JobExecution } from './execution.model';
import { JobsApiService } from './api.service';
import { DataService } from '../../data.service';

@Component({
    selector: 'app-job-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class JobDetailsComponent implements OnInit, AfterViewInit {
    job: Job;
    jobInputs = [];
    jobOutputs = [];
    jobExecutions: any;
    jobStatus: string;
    options: any;
    data: any;
    triggerOccurred: string;
    selectedJobExe: any;
    logDisplay: boolean;
    logWidth: number;
    logHeight: number;

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private jobsApiService: JobsApiService,
        private dataService: DataService
    ) {}

    private initJobDetail(data) {
        this.job = data;
        this.triggerOccurred = data.event.occurred ?
            moment.duration(moment.utc(data.event.occurred).diff(moment.utc())).humanize(true) :
            '';
        const now = moment.utc();
        const lastStatus = this.job.last_status_change ? moment.utc(this.job.last_status_change) : null;
        this.jobStatus = lastStatus ? `${_.capitalize(this.job.status)} ${lastStatus.from(now)}` : _.capitalize(this.job.status);
        this.options = {
            elements: {
                font: 'Roboto'
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
            colorFunction: () => {
                return Color('#009ac8');
            },
            maintainAspectRatio: false
        };
        this.data = {
            labels: ['Created', 'Queued', 'Executed'],
            datasets: [{
                data: [
                    [data.created, data.queued, this.dataService.calculateDuration(data.created, data.queued, true)]
                ]
            }, {
                data: [
                    [data.queued, data.started, this.dataService.calculateDuration(data.queued, data.started, true)]
                ]
            }, {
                data: [
                    [data.started, data.ended, this.dataService.calculateDuration(data.started, data.ended, true)]
                ]
            }]
        };
    }

    calculateFileSize(fileSize) {
        return this.dataService.calculateFileSizeFromBytes(fileSize, 0);
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    showExeLog(event, exe) {
        this.selectedJobExe = exe;
        this.logDisplay = true;
    }

    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.jobsApiService.getJob(id).then(data => {
                this.initJobDetail(data);

                // get job inputs
                this.jobsApiService.getJobInputs(id).then(inputData => {
                    this.jobInputs = inputData.results;
                }, err => {
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job inputs', detail: err.statusText});
                });

                // get job outputs
                this.jobsApiService.getJobOutputs(id).then(outputData => {
                    this.jobOutputs = outputData.results;
                }, err => {
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job outputs', detail: err.statusText});
                });

                // get job executions
                this.jobsApiService.getJobExecutions(id).then(exeData => {
                    this.jobExecutions = JobExecution.transformer(exeData.results);
                }, err => {
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job executions', detail: err.statusText});
                });
            }, err => {
                this.messageService.add({severity: 'error', summary: 'Error retrieving job details', detail: err.statusText});
            });
        }
    }

    ngAfterViewInit() {
        const viewportSize = this.dataService.getViewportSize();
        this.logWidth = viewportSize.width * 0.75;
        this.logHeight = viewportSize.height * 0.75;
    }
}
