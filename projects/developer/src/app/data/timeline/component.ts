import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { RecipeType } from './api.model';
import { RecipeTypesApiService } from './api.service';
import { JobsApiService } from './api.service.job';
import { DataService } from '../../common/services/data.service';
import { environment } from '../../../environments/environment';

@Component({
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {
    subscription: any;
    recipe: RecipeType;
    options: any;
    data: any;
    selectedJobExe: any;
    logDisplay: boolean;
    applyBtnClass = 'ui-button-secondary';
    started: string;
    ended: string;
    dataOptions = [
        { label: 'Recipes', value: 'recipe' },
        { label: 'Jobs', value: 'job' }
    ];

    constructor(
        private messageService: MessageService,
        private recipesApiService: RecipeTypesApiService,
        private jobsApiService: JobsApiService
    ) {}

    private createRecipeTimeline(data) {
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
                            'Total Time: ' + d[2],
                            'Created: ' + moment.utc(d[0]).format('YYYY-MM-DD HH:mm'),
                            'Deprecated: ' + moment.utc(d[1]).format('YYYY-MM-DD HH:mm')

                        ];
                    }
                }
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            },
            plugins: {
                datalabels: false,
                timeline: true,
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


    private createJobTimeline(data) {
        this.options = {
            elements: {
                font: 'Roboto',
                colorFunction: () => {
                    return Color('#42f45f');
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
                            'Total Time: ' + d[2],
                            'Started: ' + moment.utc(d[0]).format('YYYY-MM-DD HH:mm'),
                            'Ended: ' + moment.utc(d[1]).format('YYYY-MM-DD HH:mm')

                        ];
                    }
                }
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
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
            this.data.labels.push(result.job_type.name);
            if (result.ended == null) {
                todaysDate = moment.utc().format('YYYY-MM-DD HH:mm:ss[Z]');
                duration = DataService.calculateDuration(result.started, todaysDate, true);
                this.data.datasets.push({
                    data: [
                        [result.started, todaysDate, duration]
                    ]
                });
            } else {
                duration = DataService.calculateDuration(result.started, result.ended, true);
                this.data.datasets.push({
                    data: [
                        [result.started, result.ended, duration]
                    ]
                });
            }
        });
    }

    onStartSelect(e) {
        this.started = moment.utc(e, environment.dateFormat).startOf('d').format(environment.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }
    onEndSelect(e) {
        this.ended = moment.utc(e, environment.dateFormat).endOf('d').format(environment.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
    onDateFilterApply() {
            this.applyBtnClass = 'ui-button-secondary';
            return( moment.utc(this.started, environment.dateFormat).toISOString(),
            moment.utc(this.ended, environment.dateFormat).toISOString());
    }
    selectDataType(value) {
        if (value === 'recipe') {
        this.subscription = this.recipesApiService.getRecipeTypes().subscribe(data => {
        this.createRecipeTimeline(data);
        });
        } else if (value === 'job') {
            this.subscription = this.jobsApiService.getJobs().subscribe(data => {
                this.createJobTimeline(data);
                });
        } else {
                this.messageService.add({severity: 'error', summary: 'Error retrieving Timeline data'});
        }
    }
}
