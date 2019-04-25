import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { RecipeType } from './api.model';
import { RecipeTypesApiService } from './api.service';
import { DataService } from '../../common/services/data.service';
import { getLocaleDateFormat } from '@angular/common';

@Component({
    selector: 'dev-job-details',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class GanttComponent implements OnInit, OnDestroy {
    subscription: any;
    recipe: RecipeType;
    loading: boolean;
    loadingInputs: boolean;
    loadingOutputs: boolean;
    loadingExecutions: boolean;
    jobInputs = [];
    jobOutputs = [];
    jobExecutions: any;
    options: any;
    data: any;
    selectedJobExe: any;
    logDisplay: boolean;
    inputClass = 'p-col-12';
    outputClass = 'p-col-12';
    recipeGraphMinHeight = '70vh';
    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private recipesApiService: RecipeTypesApiService
    ) {}

    private initJobDetail(data) {
        this.recipe = data;
        this.recipe.id = 4;
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
                            return moment.utc(values[index]['value']).format('YYYY-MM-DD HH:mm:ss[Z]');
                        },
                        maxRotation: 90,
                        minRotation: 90,
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
            layout: {
                padding: {
                    top: 100,
                    bottom: 100
                }
            },
            plugins: {
                datalabels: false,
                timeline: true
            },
            maintainAspectRatio: false
        };

        this.data = {
            labels: [],
            datasets: []
        };

        let duration = '';
        let todaysDate = '';

         _.forEach(data.results, result => {
            this.data.labels.push(result.name);
            if (result.deprecated == null) {
                todaysDate = moment.utc().format('YYYY-MM-DD HH:mm:ss[Z]');
                duration = DataService.calculateDuration(result.created, todaysDate, true);
                this.data.datasets.push({
                    data: [
                        [result.created, todaysDate, duration]
                    ]
                });
            } else {
                duration = DataService.calculateDuration(result.created, result.deprecated, true);
                this.data.datasets.push({
                    data: [
                        [result.created, result.deprecated, duration]
                    ]
                });
            }
        });
}


    private getJobDetail(id: number) {
        this.loading = true;
        this.subscription = this.recipesApiService.getRecipeTypes(id).subscribe(data => {
            this.loading = false;
            this.initJobDetail(data);

            // get job inputs
            this.loadingInputs = true;
            this.recipesApiService.getRecipeTypes(id)
                .subscribe(inputData => {
                    this.loadingInputs = false;
                    _.forEach(inputData.results, d => {
                        d.createdTooltip = DataService.formatDate(d.created);
                        d.createdDisplay = DataService.formatDate(d.created, true);
                        d.lastModifiedTooltip = DataService.formatDate(d.deprecated);
                        d.lastModifiedDisplay = DataService.formatDate(d.deprecated, true);
                    });
                    this.jobInputs = inputData.results;
                }, err => {
                    this.loadingInputs = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job inputs', detail: err.statusText});
                });

            // get job outputs
            this.loadingOutputs = true;
            this.recipesApiService.getRecipeTypes(id)
                .subscribe(outputData => {
                    this.loadingOutputs = false;
                    _.forEach(outputData.results, d => {
                        d.createdTooltip = DataService.formatDate(d.created);
                        d.createdDisplay = DataService.formatDate(d.created, true);
                        d.deprecatedTooltip = DataService.formatDate(d.deprecated);
                        d.deprecatedDisplay = DataService.formatDate(d.deprecated, true);
                    });
                    this.jobOutputs = outputData.results;
                }, err => {
                    this.loadingOutputs = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job outputs', detail: err.statusText});
                });

            // get job executions
            this.loadingExecutions = true;
            this.recipesApiService.getRecipeTypes(id)
                .subscribe(exeData => {
                    this.loadingExecutions = false;
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
        const id = 4;
       this.getJobDetail(id);
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
