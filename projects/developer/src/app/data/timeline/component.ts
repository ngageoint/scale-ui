import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { RecipesApiService } from '../../processing/recipes/api.service';
import { JobsApiService } from '../../processing/jobs/api.service';
import { RecipesDatatable } from '../../processing/recipes/datatable.model';
import { DataService } from '../../common/services/data.service';
import { environment } from '../../../environments/environment';

import { UTCDates } from '../../common/utils/utcdates';

@Component({
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TimelineComponent implements OnInit {
    datatableOptions: RecipesDatatable;
    startDate = moment().subtract(1, 'M').startOf('d').toDate();
    endDate = moment().startOf('d').toDate();
    chartTitle: string[] = [];
    data: any;
    dataTypesLoading: boolean;
    options: any;
    showFilters: boolean;
    jobTypes: any;
    recipeTypes: any;
    dataTypeOptions: SelectItem[] = [
        { label: 'Recipe Types', value: 'Recipe Types' },
        { label: 'Job Types', value: 'Job Types' }
    ];
    selectedDataTypeOption: string;
    filterOptions = [];
    revisionOptions = [];
    selectedFilters = [];
    showChart: boolean;

    // utc versions of internal start and end dates
    get utcStartDate(): Date { return UTCDates.localDateToUTC(this.startDate); }
    get utcEndDate(): Date { return UTCDates.localDateToUTC(this.endDate); }

     get yearRange(): string {
        const now = moment();
        const start = now.clone().subtract(20, 'y').year();
        const end = now.clone().add(5, 'y').year();
        return `${start}:${end}`;
    }

    constructor(
        private messageService: MessageService,
        private recipeTypesApiService: RecipeTypesApiService,
        private jobTypesApiService: JobTypesApiService,
        private recipesApiService: RecipesApiService,
        private jobsApiService: JobsApiService
    ) {}

    // init chart data
    private createTimeline(filterSelected, type) {
        const idList = [];
        _.forEach(filterSelected, id => {
            idList.push(id.id);
        });
        console.log(idList);
        const params = {
            started: this.utcStartDate.toISOString(),
            ended: this.utcEndDate.toISOString()
        };
        if (type === 'Recipe Types') {
            this.recipesApiService.getRecipes(this.datatableOptions).subscribe(data => {
                console.log(data);
            }, err => {
                console.log(err);
                this.dataTypesLoading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
            });
        } else if (type === 'Job Types') {
            this.jobsApiService.getJobs(params).subscribe(data => {
                console.log(data);
            }, err => {
                console.log(err);
                this.dataTypesLoading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
            });
        }
        // this.datatableOptions = Object.assign(this.datatableOptions, {
        //     started: this.startDate,
        //     ended: this.endDate,
        //     id: idList
        // });

        this.showChart = true;
        this.showFilters = false;
        this.data = {
            labels: [],
            datasets: []
        };

        // create y-axis labels
        _.forEach(this.selectedFilters, filter => {
            const label = this.selectedDataTypeOption === 'Job Types' ?
                `${filter.title} v${filter.version}` :
                `${filter.title} rev ${filter.revision_num}`;
            this.data.labels.push(label);
        });

        // set chart title
        const chartTitle: string[] = [];
        chartTitle.push(this.selectedDataTypeOption);
        this.options.title = {
            display: true,
            text: chartTitle,
            fontSize: 16
        };

        // calculate duration between created date and deprecated date for each recipe type or job type selected
        // _.forEach(data, d => {
        //     // if type has not been deprecated, use the current date
        //     const deprecated = d.deprecated ? d.deprecated : moment.utc().toISOString();
        //     console.log(d.created)
        //     this.data.datasets.push({
        //         data: [
        //             [d.created, deprecated]
        //         ]
        //     });
        // });
    }

    // enable or disable button based on selected type(s)
    enableButton() {
        return this.selectedFilters.length > 0;
    }

    // retrieve job types or recipe types and populate filter dropdown options
    getFilterOptions() {
        this.dataTypesLoading = true;
        this.filterOptions = [];
        this.selectedFilters = [];
        this.enableButton();
        if (this.selectedDataTypeOption === 'Job Types') {
            this.jobTypesApiService.getJobTypes().subscribe(data => {
                this.dataTypesLoading = false;
                this.jobTypes = data.results;
                _.forEach(this.jobTypes, jobType => {
                    this.filterOptions.push({
                        label: `${jobType.title} v${jobType.version}`,
                        value: jobType
                    });
                });
                this.filterOptions = _.orderBy(this.filterOptions, 'label', 'asc');
            }, err => {
                console.log(err);
                this.dataTypesLoading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
            });
        } else if (this.selectedDataTypeOption === 'Recipe Types') {
            this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
                this.dataTypesLoading = false;
                this.recipeTypes = data.results;
                _.forEach(this.recipeTypes, recipeType => {
                    this.filterOptions.push({
                        label: `${recipeType.title}`,
                        value: recipeType
                    });
                });
                // this.revisionOptions.push({
                //     label: ['Landsat rev 1', 'Landsat rev 2', 'Landsat rev 3'],
                //     data: [1, 2, 3]
                // });
                this.filterOptions = _.orderBy(this.filterOptions, 'label', 'asc');
            }, err => {
                console.log(err);
                this.dataTypesLoading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
            });
        }
    }

    onTypesClick() {
        this.revisionOptions = [];
        _.forEach(this.selectedFilters, recipe => {
            this.recipeTypesApiService.getRecipeTypeRev(recipe.name).subscribe(data => {
                console.log(data);
                _.forEach(data.results, filter => {
                    this.revisionOptions.push({
                        label: `${recipe.title} rev ${recipe.revision_num}`,
                        value: recipe
                    });
                });
            //     this.dataTypesLoading = false;
            //     this.recipeTypes = data.results;
            //     _.forEach(this.recipeTypes, recipeType => {
            //         this.filterOptions.push({
            //             label: `${recipeType.title}`,
            //             value: recipeType
            //         });
            //     });
            //     // this.revisionOptions.push({
            //     //     label: ['Landsat rev 1', 'Landsat rev 2', 'Landsat rev 3'],
            //     //     data: [1, 2, 3]
            //     // });
            //     this.filterOptions = _.orderBy(this.filterOptions, 'label', 'asc');
            // if (_.find(, recipe)) {
            //     this.revisionOptions.push({
            //         label: `${recipe.title} rev ${recipe.revision_num}`,
            //         value: recipe
            //     });
            // }
        });
        this.enableButton();
        });
    }
    onUpdateChartClick()  {
        this.createTimeline(this.selectedFilters, this.selectedDataTypeOption);
    }

    ngOnInit() {
        this.showChart = false;
        this.showFilters = true;
        this.options = {
            title: {
                display: false,
                text: [],
                fontSize: 16
            },
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
                            return moment.utc(values[index]['value']).format(environment.dateFormat);
                        },
                        maxRotation: 90,
                        minRotation: 50,
                        autoSkip: true
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: (tooltipItem, chartData) => {
                        const d = chartData.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        return [
                            'Total Time: ' + d[2],
                            'Created: ' + moment.utc(d[0]).format(environment.dateFormat),
                            'Deprecated: ' + moment.utc(d[1]).format(environment.dateFormat)
                        ];
                    }
                }
            },
            plugins: {
                datalabels: false,
                timeline: true,
            },
            responsive: true,
            maintainAspectRatio: false
        };
    }

}
