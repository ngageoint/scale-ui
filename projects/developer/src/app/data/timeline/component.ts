import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Color from 'chartjs-color';

import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { TimelineApiService } from './api.service';
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
    previousSelectedDataOption: string;
    typeSubscription: any;
    filterOptions = [];
    includeRevisions = false;
    showDeprecated = false;
    revisionOptions = [];
    selectedFilters = [];
    selectedRevs = [];
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
        private timelineApiService: TimelineApiService,
    ) {}

    // init chart data
    private createTimeline(type) {
        this.showChart = true;
        this.showFilters = false;
        const params = {
            started: this.utcStartDate.toISOString(),
            ended: this.utcEndDate.toISOString(),
            id: this.selectedFilters.map(f => f.id),
            rev: this.selectedRevs.map(r => r.value.revision_num)
        };

        if (type === 'Recipe Types') {
            this.timelineApiService.getRecipeTypeDetails(params).subscribe(data => {
                const chartData = this.generateChartData(data.results);

                // add the labels
                data.results.forEach(result => {
                    chartData.labels.push(`${result.title} rev ${result.revision_num}`);
                });

                // assign new data at once to trigger a change detection
                this.data = chartData;
            }, err => {
                console.log(err);
                this.dataTypesLoading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving recipe types', detail: err.statusText});
            });
        } else if (type === 'Job Types') {
            this.timelineApiService.getJobTypeDetails(params).subscribe(data => {
                const chartData = this.generateChartData(data.results);

                // add the labels
                data.results.forEach(result => {
                    chartData.labels.push(`${result.title} v${result.version}`);
                });

                // assign new data at once to trigger a change detection
                this.data = chartData;
            }, err => {
                console.log(err);
                this.dataTypesLoading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
            });
        }

        // set chart title
        const chartTitle: string[] = [];
        chartTitle.push(this.selectedDataTypeOption);
        this.options.title = {
            display: true,
            text: chartTitle,
            fontSize: 16
        };
    }

    /**
     * Creates chart data by grouping the results into contiguous blocks of time.
     * @param  apiData recipe or job data returned from the api
     * @return         object with properties needed for chartjs data assignment
     */
    private generateChartData(apiData: any): any {
        const chartData = {
            type: 'timeline',
            labels: [],
            datasets: []
        };

        _.forEach(apiData, result => {
            // start by sorting the results by the date
            result.results.sort((a: any, b: any) => {
                const dateA = moment(a.date);
                const dateB = moment(b.date);
                return dateA.isAfter(dateB);
            });

            // the new dataset to be created
            const newDataset = [];

            // used to hold on to contiguous blocks of time
            let previousStart = null;

            for (let i = 0; i < result.results.length; i++) {
                const item = result.results[i];
                const nextItem = result.results[i + 1];

                // use blocks of time based on the day
                const start = moment(item.date);
                const end = moment(item.date).add(1, 'days');

                if (!nextItem) {
                    // no next item, at the end of the array
                    // save just the start and end
                    newDataset.push([previousStart ? previousStart : start, end, '']);
                } else {
                    if (moment(nextItem.date).isSame(end)) {
                        // starting a continguous block of time
                        if (!previousStart) {
                            // only save the start if not already in a continguous block
                            previousStart = start;
                        }
                    } else {
                        // the next item in the array is not the same as this ending period's day
                        if (previousStart) {
                            // a previous start was available from another block
                            newDataset.push([previousStart, end, '']);
                            previousStart = null;
                        } else {
                            // no previous start was available, use this time block
                            newDataset.push([start, end, '']);
                        }
                    }
                }
            }

            // add to the new data that will be assigned
            chartData.datasets.push({
                data: newDataset
            });
        });

        return chartData;
    }

    // enable or disable button based on selected type(s)
    enableButton() {
        return this.selectedFilters.length > 0;
    }

    // retrieve job types or recipe types and populate filter dropdown options
    getFilterOptions() {
        this.dataTypesLoading = true;
        this.filterOptions = [];
        this.enableButton();
        const params = { page_size: 1000, is_active: (this.showDeprecated === true) ? null : true };
        if (this.previousSelectedDataOption === this.selectedDataTypeOption) {
            this.selectedFilters = this.selectedFilters.filter(selected => {
                return (selected.is_active === true);
            });
        } else {
            this.selectedFilters = [];
        }
        if (this.typeSubscription) {
            this.typeSubscription.unsubscribe();
        }
        if (this.selectedDataTypeOption === 'Job Types') {
            this.typeSubscription = this.jobTypesApiService.getJobTypes(params).subscribe(data => {
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
            this.typeSubscription = this.recipeTypesApiService.getRecipeTypes(params).subscribe(data => {
                this.dataTypesLoading = false;
                this.recipeTypes = data.results;
                _.forEach(this.recipeTypes, recipeType => {
                    this.filterOptions.push({
                        label: `${recipeType.title}`,
                        value: recipeType
                    });
                });
                this.filterOptions = _.orderBy(this.filterOptions, 'label', 'asc');
            }, err => {
                console.log(err);
                this.dataTypesLoading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving job types', detail: err.statusText});
            });
        }
        this.previousSelectedDataOption = this.selectedDataTypeOption;
    }

    onTypesClick() {
        this.revisionOptions = [];
        if (this.selectedDataTypeOption === 'Recipe Types') {
            _.forEach(this.selectedFilters, recipe => {
                this.recipeTypesApiService.getRecipeTypeRev(recipe.name).subscribe(data => {
                    _.forEach(data.results, result => {
                        this.revisionOptions.push({
                            label: `${result.recipe_type.title} rev ${result.revision_num}`,
                            value: result
                        });
                    });
                });
            });
        } else if (this.selectedDataTypeOption === 'Job Types' ) {
            _.forEach(this.selectedFilters, job => {
                this.jobTypesApiService.getJobTypeVersions(job.name).subscribe(data => {
                    _.forEach(data.results, result => {
                        this.revisionOptions.push({
                            label: `${result.title} rev ${result.version}`,
                            value: result
                        });
                    });
            });
        });
        }
        this.enableButton();
    }
    onUpdateChartClick() {
        if (this.includeRevisions) {
           // Include all revisions
           this.selectedRevs = this.revisionOptions;
        }
        this.createTimeline(this.selectedDataTypeOption);
    }

    onShowDeprecated() {
        if (this.selectedDataTypeOption) {
            this.getFilterOptions();
        }
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
                    time: {
                        unit: 'day'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 50,
                        autoSkip: true
                    }
                }]
            },
            tooltips: {
                enabled: false
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
