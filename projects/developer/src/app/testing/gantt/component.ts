import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { Recipe } from './api.model';
import { RecipeExecution } from './execution.model';
import { RecipesApiService } from './api.service';
import { DataService } from '../../common/services/data.service';
import { debuglog } from 'util';

@Component({
    selector: 'dev-job-details',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class GanttComponent implements OnInit, OnDestroy {
    subscription: any;
    recipe: Recipe;
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
    selectedJobExe: any;
    logDisplay: boolean;
    inputClass = 'p-col-12';
    outputClass = 'p-col-12';

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private jobsApiService: RecipesApiService
    ) {}

    private initJobDetail(data) {
        this.recipe = data;
        this.recipe.id = 4;
        const now = moment.utc();
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
                            return moment.utc(values[index]['value']).format('YYYY-MM-DD');
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
                            moment.utc(d[0]).format('YYYY-MM-DD HH:mm'),
                            moment.utc(d[1]).format('YYYY-MM-DD HH:mm')
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
            labels: [data.id],
            datasets: [{
                data: [
                    [data.created, data.deprecated, DataService.calculateDuration(data.created, data.deprecated, true)]
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
        console.log(data.queued);
    }

    private getJobDetail(id: number) {
        this.loading = true;
        this.subscription = this.jobsApiService.getRecipe(id, true).subscribe(data => {
            this.loading = false;
            this.initJobDetail(data);

            // get job inputs
            this.loadingInputs = true;
            this.jobsApiService.getRecipe(id)
                .subscribe(inputData => {
                    this.loadingInputs = false;
                    _.forEach(inputData.results, d => {
                        d.createdTooltip = DataService.formatDate(d.created);
                        d.createdDisplay = DataService.formatDate(d.created, true);
                        d.lastModifiedTooltip = DataService.formatDate(d.last_modified);
                        d.lastModifiedDisplay = DataService.formatDate(d.last_modified, true);
                    });
                    this.jobInputs = inputData.results;
                    this.inputClass = 'p-col-12';
                }, err => {
                    this.loadingInputs = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job inputs', detail: err.statusText});
                });

            // get job outputs
            this.loadingOutputs = true;
            this.jobsApiService.getRecipe(id)
                .subscribe(outputData => {
                    this.loadingOutputs = false;
                    _.forEach(outputData.results, d => {
                        d.createdTooltip = DataService.formatDate(d.created);
                        d.createdDisplay = DataService.formatDate(d.created, true);
                        d.lastModifiedTooltip = DataService.formatDate(d.last_modified);
                        d.lastModifiedDisplay = DataService.formatDate(d.last_modified, true);
                    });
                    this.jobOutputs = outputData.results;
                    this.outputClass = 'p-col-12';
                }, err => {
                    this.loadingOutputs = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job outputs', detail: err.statusText});
                });

            // get job executions
            this.loadingExecutions = true;
            this.jobsApiService.getRecipe(id)
                .subscribe(exeData => {
                    this.loadingExecutions = false;
                    this.jobExecutions = RecipeExecution.transformer(exeData.results);
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
            const id = 1;
            this.getJobDetail(id);
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
