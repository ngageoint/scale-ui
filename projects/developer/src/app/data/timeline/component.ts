import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { Recipe } from '../../processing/recipes/api.model';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
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
    data: any;
    options: any;
    selectedDataOption: string;
    showFilters: boolean;
    jobTypes: any;
    recipeTypes: any;
    typeDropdownOptions: SelectItem[];
    selectedType: any = [];
    showChart: boolean;
    typeSelected: boolean;
    dateFiltered: any;
    applyBtnClass = 'ui-button-secondary';
    todaysDate = moment.utc().format('YYYY-MM-DD HH:mm:ss[Z]');
    started = moment.utc().subtract(4, 'y').startOf('d').toISOString();
    ended = moment.utc().endOf('d').toISOString();
    dataOptions: SelectItem[] = [
        { label: 'Recipe Types', value: 'Recipe Types' },
        { label: 'Job Types', value: 'Job Types' }
    ];

    constructor(
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private jobTypesApiService: JobTypesApiService
    ) {}

    private createTimeline(data) {
        this.showChart = true;
        this.showFilters = false;
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

        _.forEach(this.selectedType, filteredLabels => {
            this.data.labels.push(filteredLabels.title + ' ' + filteredLabels.version);
        });
        _.forEach(data, filterType => {
            if (filterType.deprecated == null) {
                duration = DataService.calculateDuration(filterType.created, this.todaysDate, true);
                this.data.datasets.push({
                    data: [
                        [filterType.created, this.todaysDate, duration]
                    ]
                });
            } else {
                duration = DataService.calculateDuration(filterType.created, filterType.deprecated, true);
                this.data.datasets.push({
                    data: [
                        [filterType.created, filterType.deprecated, duration]
                    ]
                });
            }
        });
    }

    enableButton() {
        if (this.selectedType.length === 0) {
            this.typeSelected = true;
        } else {
            this.typeSelected = false;
        }
    }

    getTypesFilter() {
        this.selectedType = [];
        this.enableButton();
        if (this.selectedDataOption === 'Job Types') {
            const selectItems = [];
                _.forEach(this.jobTypes, jobType => {
                selectItems.push({
                    label: jobType.title + ' ' + jobType.version,
                    value: jobType
                });
            });
            this.typeDropdownOptions = _.orderBy(selectItems, 'label', 'asc');
        } else if (this.selectedDataOption === 'Recipe Types') {
            const selectItems = [];
            _.forEach(this.recipeTypes, recipeType => {
                selectItems.push({
                    label: recipeType.title + ' ' + recipeType.version,
                    value: recipeType
                });
            });
            this.typeDropdownOptions = _.orderBy(selectItems, 'label', 'asc');
        }
    }

    onApplyClick() {
        this.applyBtnClass = 'ui-button-secondary';
        this.dateFiltered = _.filter(this.selectedType, (result: any) => {
            if (result.deprecated == null) {
                result.deprecated = this.todaysDate;
            }
            return moment.utc(result.created).isSameOrAfter(moment.utc(this.started)) &&
                moment.utc(result.deprecated).isSameOrBefore(moment.utc(this.ended));
            });
            this.createTimeline(this.dateFiltered);
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
        this.typeSelected = true;
        this.showChart = false;
        this.showFilters = true;

        this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = data.results;
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
        });

        this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            this.recipeTypes = data.results;
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
        });
    }

}
