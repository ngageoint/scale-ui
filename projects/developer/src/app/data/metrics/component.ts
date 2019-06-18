import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SelectItem, ColorPickerModule } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';
import * as moment from 'moment';

import { MetricsApiService } from './api.service';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';
import { ChartService } from './chart.service';
import { DataService } from '../../common/services/data.service';
import { UIChart } from 'primeng/primeng';
import { JobType } from '../../configuration/job-types/api.model';

@Component({
    selector: 'dev-metrics',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class MetricsComponent implements OnInit, AfterViewInit {
    @ViewChild('chart') chart: UIChart;
    chartLoading: boolean;
    showChart: boolean;
    started = moment.utc().subtract(1, 'M').startOf('d').format('YYYY-MM-DD');
    ended = moment.utc().startOf('d').format('YYYY-MM-DD');
    availableDataTypes: SelectItem[] = [];
    dataTypesLoading: boolean;
    selectedDataType: any;
    filtersApplied: any[] = [];
    selectedDataTypeOptions: any = [];
    dataTypeFilterText = '';
    recipeChoiceSelected: any[] = [];
    recipeChoicesOptions: any[] = [];
    recipeTypes: any[] = [];
    filteredChoices: any[] = [];
    filteredChoicesOptions: any[] = [];
    filteredChoicesLoading: boolean;
    columns: any[] = [];
    metricOptions: SelectItem[] = [];
    selectedMetric1: any;
    selectedMetric2: any;
    chartTypes: SelectItem[];
    selectedChartType1: any;
    selectedChartType2: any;
    yUnits1: any;
    yUnits2: any;
    multiAxis: boolean;
    data: any;
    options: any;
    showFilters = true;
    primaryColorOptions: any[] = [];
    primaryColorDisplay: any[] = [];
    secondaryColorOptions: any[] = [];
    secondaryColorDisplay: any[] = [];
    constructor(
        private messageService: MessageService,
        private metricsApiService: MetricsApiService,
        private recipeTypesApiService: RecipeTypesApiService,
        private chartService: ChartService
    ) {
        this.chartTypes = [
            {
                label: 'Area',
                value: 'area'
            },
            {
                label: 'Bar',
                value: 'bar'
            },
            {
                label: 'Line',
                value: 'line'
            }
        ];
        this.selectedChartType1 = 'bar';
        this.selectedChartType2 = 'line';
    }

    private formatYValues(units, data, noPadding?) {
        noPadding = noPadding || false;
        if (units === 'seconds') {
            const r = DataService.calculateDuration(moment.utc().startOf('d'), moment.utc().startOf('d').add(data, 's'), noPadding);
            return r;
        } else if (units === 'bytes') {
            return DataService.calculateFileSizeFromBytes(data, 1);
        }
        return data;
    }
    getDataTypes() {
        this.dataTypesLoading = true;
        this.metricsApiService.getDataTypes().subscribe((data) => {
            this.dataTypesLoading = false;
            _.forEach(data.results, (result) => {
                this.availableDataTypes.push({
                    label: result.title,
                    value: result
                });
            });
        }, err => {
            this.dataTypesLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving data types', detail: err.statusText});
        });
    }
    getDataTypeOptions() {
        this.filteredChoicesLoading = true;
        this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            this.recipeTypes = data.results;
        });
        this.metricsApiService.getDataTypeOptions(this.selectedDataType.name).subscribe(result => {
            this.filteredChoicesLoading = false;
            this.selectedDataTypeOptions = result;
            if (this.selectedDataType.name === 'job-types') {
                // filter out inactive job types from result set
                this.selectedDataTypeOptions.choices = _.filter(result.choices, choice => {
                    return choice.is_active === true;
                });
            }
            const recipeChoicesOptions = [];
            _.forEach(this.recipeTypes, (choice) => {
                recipeChoicesOptions.push({
                    label: choice.version ? choice.title + ' ' + choice.version : choice.title,
                    value: _.forEach(choice.job_types, (jobType) => {
                            if (JobType.name === result.choices.name ) {
                                return result.choices;
                            }
                    })
                });
            });
            this.recipeChoicesOptions = recipeChoicesOptions;
            _.forEach(result.filters, (filter) => {
                this.dataTypeFilterText = this.dataTypeFilterText.length === 0 ?
                    _.capitalize(filter.param) :
                    this.dataTypeFilterText + ', ' + _.capitalize(filter.param);
            });
            this.filteredChoices = _.orderBy(result.choices, ['title', 'version'], ['asc', 'asc']);
            // format filteredChoices for use with multiselect directive
            const filteredChoicesOptions = [];
            _.forEach(this.filteredChoices, (choice) => {
                filteredChoicesOptions.push({
                    label: choice.version ? choice.title + ' ' + choice.version : choice.title,
                    value: choice
                });
            });
            this.filteredChoicesOptions = filteredChoicesOptions;
            this.columns = _.orderBy(result.columns, ['title'], ['asc']);
            _.forEach(this.columns, (column) => {
                const option = {
                    label: column.title,
                    value: column
                };
                this.metricOptions.push(option);
            });
            this.metricOptions.unshift({
                label: 'None',
                value: null
            });
        }, err => {
            this.filteredChoicesLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving data type options', detail: err.statusText});
        });
    }
    onStartSelect(e) {
        this.started = e;
    }
    onEndSelect(e) {
        this.ended = e;
    }
    changeDataTypeSelection() {
        // reset options
        this.filtersApplied = [];
        this.selectedDataTypeOptions = [];
        this.dataTypeFilterText = '';
        this.selectedMetric1 = null;
        this.selectedMetric2 = null;
        this.recipeChoiceSelected = null;
        this.columns = [];
        this.metricOptions = [];
        this.primaryColorOptions = [];

        if (!this.selectedDataType.name || this.selectedDataType.name === '') {
            this.selectedDataType = {};
            this.getDataTypes();
        } else {
            this.getDataTypeOptions();
        }
    }
    getRecipeJobTypes() {
        if (this.recipeChoiceSelected != null) {
            const filtersApplied = [];
            _.forEach(this.recipeChoiceSelected, (outerRecipe) => {
                _.forEach(outerRecipe, (selectedRecipe) => {
                    _.forEach(this.filteredChoicesOptions, (jobTypeInfo) => {
                        if (jobTypeInfo.value.name === selectedRecipe.name) {
                            filtersApplied.push(jobTypeInfo.value);
                        }
                    });
                });
            });
            this.filtersApplied = filtersApplied;
            this.colorGenerator('primary');
            this.colorGenerator('secondary');
        } else {
            this.changeDataTypeSelection();
        }
    }
    updateChart() {
        if (_.isEqual(this.selectedMetric1, this.selectedMetric2)) {
            this.messageService.add({severity: 'warn', summary: 'Selected the same metric twice'});
            return false;
        }
        this.showChart = true;
        this.chartLoading = true;
        this.showFilters = false;
        this.yUnits1 = this.selectedMetric1.units;
        this.yUnits2 = this.selectedMetric2 ? this.selectedMetric2.units : null;
        this.multiAxis = this.yUnits2 && this.yUnits1 !== this.yUnits2;
        const yAxes = [{
            id: 'yAxis1',
            position: this.multiAxis ? 'right' : 'left',
            stacked: this.filtersApplied.length > 0,
            scaleLabel: {
                display: true,
                labelString: this.selectedMetric1.title
            },
            ticks: {
                callback: (value) => {
                    return this.formatYValues(this.yUnits1, value);
                }
            }
        }];
        if (this.selectedMetric2 && this.multiAxis) {
            // user selected a second metric; another axis is needed
            yAxes.push({
                id: 'yAxis2',
                position: 'left',
                stacked: this.filtersApplied.length > 0,
                scaleLabel: {
                    display: true,
                    labelString: this.selectedMetric2.title
                },
                ticks: {
                    callback: (value) => {
                        return this.formatYValues(this.yUnits2, value);
                    }
                }
            });
        }

        const params = {
            page: 1,
            page_size: null,
            started: moment.utc(this.started).toISOString(),
            ended: moment.utc(this.ended).toISOString(),
            choice_id: _.map(this.filtersApplied, 'id'),
            column: this.selectedMetric2 ? [this.selectedMetric1.name, this.selectedMetric2.name] : this.selectedMetric1.name,
            group: this.selectedMetric2 ? [this.selectedMetric1.group, this.selectedMetric2.group] : this.selectedMetric1.group,
            dataType: this.selectedDataType.name,
            primary_colors: this.primaryColorOptions,
            secondary_colors: this.secondaryColorOptions
        };
        this.metricsApiService.getPlotData(params).subscribe((data) => {
            const chartData = this.chartService.formatPlotResults(
                data,
                params,
                this.filtersApplied,
                this.selectedDataType.title,
                this.multiAxis,
                this.selectedMetric1,
                this.selectedMetric2,
                this.selectedChartType1,
                this.selectedChartType2
            );

            // compute total count for requested time period
            let primaryTotal = 0;
            let secondaryTotal = 0;
            _.forEach(chartData.data, dataset => {
                if (dataset.isPrimary) {
                    primaryTotal = primaryTotal + _.sum(dataset.data);
                } else {
                    secondaryTotal = secondaryTotal + _.sum(dataset.data);
                }
            });

            // set chart title
            const formattedTotal = this.formatYValues(this.yUnits1, primaryTotal, true),
                formattedStart = moment.utc(this.started, 'YYYY-MM-DD').format('DD MMMM YYYY'),
                formattedEnd = moment.utc(this.ended, 'YYYY-MM-DD').format('DD MMMM YYYY'),
                chartTitle: String[] = [];
            chartTitle.push(`${formattedStart} - ${formattedEnd}`);
            chartTitle.push(`${this.selectedMetric1.title}: ${formattedTotal.toLocaleString()}`);
            if (this.yUnits2) {
                const formattedTotal2 = this.formatYValues(this.yUnits2, secondaryTotal, true);
                chartTitle.push(`${this.selectedMetric2.title}: ${formattedTotal2.toLocaleString()}`);
            }

            // initialize chart
            this.data = {
                labels: chartData.labels,
                datasets: chartData.data
            };
            this.options = {
                title: {
                    display: true,
                    text: chartTitle,
                    fontSize: 16
                },
                legend: {
                    position: 'right',
                    display: this.filtersApplied.length > 1 || this.selectedMetric2
                },
                plugins: {
                    datalabels: {
                        display: false
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: yAxes
                },
                maintainAspectRatio: false,
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, tooltipData) => {
                            const dataset = tooltipData.datasets[tooltipItem.datasetIndex];
                            if (this.multiAxis) {
                                if (dataset.yAxisID === 'yAxis1') {
                                    return `${this.selectedMetric1.title}: ${this.formatYValues(this.yUnits1, tooltipItem.yLabel)}`;
                                }
                                return `${this.selectedMetric2.title}: ${this.formatYValues(this.yUnits2, tooltipItem.yLabel)}`;
                            }
                            return `${dataset.label}: ${this.formatYValues(this.yUnits1, tooltipItem.yLabel)}`;
                        }
                    }
                }
            };
            this.chartLoading = false;
        }, err => {
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving plot data', detail: err.statusText});
        });
    }
    private colorGenerator(metric) {
        const selected = [];
        // populate new color array to compare with the current one.
        // Must populate the same to use the differenceBy function
        _.forEach(this.filtersApplied, choice => {
            selected.push({
                name: choice.tile ? choice.title + ' ' + choice.version : choice.title,
                color: '#' + (Math.random().toString(16) + '0000000').slice(2, 8)
            });
        });
        if (metric === 'primary') {
            if (this.primaryColorOptions.length > this.filtersApplied.length) {
                const objectToRemove = _.differenceBy(this.primaryColorOptions, selected, 'name');
                _.forEach(objectToRemove , object => {
                    const indexToRemove = this.primaryColorOptions.findIndex(x => x.name === object.name);
                    if (indexToRemove !== -1) {
                        this.primaryColorOptions.splice(indexToRemove, 1);
                    }
                });
            }
            if (this.filtersApplied.length > 0) {
                _.forEach(this.filtersApplied, choice => {
                    this.primaryColorOptions.push({
                        name: choice.tile ? choice.title + ' ' + choice.version : choice.title,
                        color: '#' + (Math.random().toString(16) + '0000000').slice(2, 8)
                    });
                });
            }
            // remove duplicate colors first
            this.primaryColorOptions = _.uniqBy(this.primaryColorOptions, 'name');
            this.primaryColorDisplay = this.primaryColorOptions;
        } else if (metric === 'secondary') {
            if (this.secondaryColorOptions.length > this.filtersApplied.length) {
                // populate new color array to compare with the current one.
                // Must populate the same to use the differenceBy function
                const objectToRemove = _.differenceBy(this.secondaryColorOptions, selected, 'name');
                _.forEach(objectToRemove , object => {
                    const indexToRemove = this.secondaryColorOptions.findIndex(x => x.name === object.name);
                    if (indexToRemove !== -1) {
                        this.secondaryColorOptions.splice(indexToRemove, 1);
                    }
                });
            }
            if (this.filtersApplied.length > 0) {
                _.forEach(this.filtersApplied, choice => {
                    this.secondaryColorOptions.push({
                        name: choice.tile ? choice.title + ' ' + choice.version : choice.title,
                        color: '#' + (Math.random().toString(16) + '0000000').slice(2, 8)
                    });
                });
            }
            // remove duplicate colors first
            this.secondaryColorOptions = _.uniqBy(this.secondaryColorOptions, 'name');
            this.secondaryColorDisplay = this.secondaryColorOptions;
        }
    }

    ngOnInit() {
        this.getDataTypes();
    }

    ngAfterViewInit() {
        if (this.chart.chart) {
            this.chart.chart.canvas.parentNode.style.height = '85vh';
        }
    }
}
