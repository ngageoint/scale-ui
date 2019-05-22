import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { Recipe } from '../../processing/recipes/api.model';
import { RecipesApiService } from '../../processing/recipes/api.service';
import { RecipesDatatable, initialRecipesDatatable } from '../../processing/recipes/datatable.model';
import { JobsApiService } from '../../processing/jobs/api.service';
import { JobsDatatable } from '../../processing/jobs/datatable.model';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { DataService } from '../../common/services/data.service';
import { environment } from '../../../environments/environment';

@Component({
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TimelineComponent implements OnInit {
    @Input() datatableOptions: JobsDatatable;
    subscription: any;
    recipe: Recipe;
    options: any;
    data: any;
    chartColor: any;
    selectedJobExe: any;
    logDisplay: boolean;
    applyBtnClass = 'ui-button-secondary';
    started = moment.utc().subtract(3, 'd').startOf('d').toISOString();
    ended = moment.utc().endOf('d').toISOString();
    dataOptions: SelectItem[] = [
        { label: 'Recipe Types', value: 'Recipe Types' },
        { label: 'Job Types', value: 'Job Types' }
    ];
    selectedDataOption: string;
    showFilters: boolean;
    jobTypes: any;
    jobTypeOptions: SelectItem[];
    selectedJobType: any = [];

    constructor(
        private messageService: MessageService,
        private recipesApiService: RecipesApiService,
        private jobsApiService: JobsApiService,
        private jobTypesApiService: JobTypesApiService
    ) {}

    private createTimeline(data) {
        this.showFilters = false;
        this.options = {
            elements: {
                font: 'Roboto',
                colorFunction: () => {
                    return Color(this.chartColor);
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
            if (result.job_type.name !== 'undefined') {
            this.data.labels.push(result.job_type.name);
            } else {
                this.data.labels.push(result.name);
            }
            console.log(result.job_type);
            if (result.deprecated == null) {
                todaysDate = moment.utc().format('YYYY-MM-DD HH:mm:ss[Z]');
                duration = DataService.calculateDuration(result.started, todaysDate, true);
                this.data.datasets.push({
                    data: [
                        [result.started, todaysDate, duration]
                    ]
                });
            } else {
                duration = DataService.calculateDuration(result.created, result.ended, true);
                this.data.datasets.push({
                    data: [
                        [result.started, result.ended, duration]
                    ]
                });
            }
        });
    }

    private getJobTypes() {
        this.selectedJobType = [];
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = data.results;
            const selectItems = [];
            _.forEach(this.jobTypes, jobType => {
                selectItems.push({
                    label: jobType.title + ' ' + jobType.version,
                    value: jobType
                });
                console.log(selectItems);
                
                    this.selectedJobType.push(jobType);
            });
            this.jobTypeOptions = _.orderBy(selectItems, 'label', 'asc');
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
        });
    }

    onApplyClick() {
        this.applyBtnClass = 'ui-button-secondary';
        if (this.selectedDataOption === 'Job Types') {
            this.chartColor = '#42f45f';
            this.jobsApiService.getJobs({
                started: this.started,
                ended: this.ended
            }).subscribe(data => {
                this.createTimeline(data);
            }, err => {
                console.log(err);
            });
        } else {
            this.chartColor = '#017cce';
            const params: RecipesDatatable = initialRecipesDatatable;
            params.started = this.started;
            params.ended = this.ended;
            console.log(params);
            this.recipesApiService.getRecipes(params).subscribe(data => {
                this.createTimeline(data);
            }, err => {
                console.log(err);
            });
        }
    }

    onStartSelect(e) {
        this.started = moment.utc(e, environment.dateFormat).startOf('d').format(environment.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }
    onEndSelect(e) {
        this.ended = moment.utc(e, environment.dateFormat).endOf('d').format(environment.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }

    ngOnInit() {
        this.showFilters = true;
    }

}
