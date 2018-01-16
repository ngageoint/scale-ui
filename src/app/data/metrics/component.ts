import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';
import * as moment from 'moment';

import { MetricsApiService } from './api.service';
import { ChartService } from './chart.service';
import { DataService } from '../../data.service';

@Component({
    selector: 'app-metrics',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class MetricsComponent implements OnInit {
    started = moment.utc().subtract(1, 'M').startOf('d').format('YYYY-MM-DD');
    ended = moment.utc().startOf('d').format('YYYY-MM-DD');
    availableDataTypes: SelectItem[] = [];
    selectedDataType: any;
    filtersApplied: any[] = [];
    selectedDataTypeOptions: any[] = [];
    dataTypeFilterText = '';
    filteredChoices: any[] = [];
    filteredChoicesOptions: any[] = [];
    columns: any[] = [];
    metricOptions: SelectItem[] = [];
    selectedMetric1: any;
    selectedMetric2: any;
    yUnits1: any;
    yUnits2: any;
    data: any;
    options: any;
    showFilters = true;
    constructor(
        private metricsApiService: MetricsApiService,
        private chartService: ChartService,
        private dataService: DataService
    ) {}

    private formatYValues(units, data, noPadding?) {
        noPadding = noPadding || false;
        if (units === 'seconds') {
            return this.dataService.calculateDuration(moment.utc().startOf('d'), moment.utc().startOf('d').add(data, 's'), noPadding);
        } else if (units === 'bytes') {
            return this.dataService.calculateFileSizeFromBytes(data, 1);
        }
        return data;
    }

    getDataTypes() {
        this.metricsApiService.getDataTypes().then((data) => {
            _.forEach(data.results, (result) => {
                this.availableDataTypes.push({
                    label: result.title,
                    value: result
                });
            });
        });
    }
    getDataTypeOptions() {
        this.metricsApiService.getDataTypeOptions(this.selectedDataType.name).then((result) => {
            this.selectedDataTypeOptions = result;
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
        this.columns = [];
        this.metricOptions = [];

        if (!this.selectedDataType.name || this.selectedDataType.name === '') {
            this.selectedDataType = {};
            this.getDataTypes();
        } else {
            this.getDataTypeOptions();
        }
    }
    updateChart() {
        this.showFilters = false;
        const yAxes = [{
            id: 'yAxis1',
            position: 'left',
            stacked: true,
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
        if (this.selectedMetric2) {
            // user selected a second metric; another axis is needed
            yAxes.push({
                id: 'yAxis2',
                position: 'right',
                stacked: true,
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
            page: null,
            page_size: null,
            started: this.started,
            ended: this.ended,
            choice_id: _.map(this.filtersApplied, 'id'),
            column: this.selectedMetric2 ? [this.selectedMetric1.name, this.selectedMetric2.name] : this.selectedMetric1.name,
            group: this.selectedMetric2 ? [this.selectedMetric1.group, this.selectedMetric2.group] : this.selectedMetric1.group,
            dataType: this.selectedDataType.name
        };
        this.metricsApiService.getPlotData(params).then((data) => {
            this.yUnits1 = this.selectedMetric1.units;
            this.yUnits2 = this.selectedMetric2 ? this.selectedMetric2.units : null;

            const chartData = this.chartService.formatPlotResults(data, params, this.filtersApplied, this.selectedDataType.title);

            // compute total count for requested time period
            let total = 0;
            _.forEach(chartData.data, dataset => {
                total = total + _.sum(dataset.data);
            });

            // set chart title
            const formattedTotal = this.formatYValues(this.yUnits1, total, true),
                formattedStart = moment.utc(this.started, 'YYYY-MM-DD').format('DD MMMM YYYY'),
                formattedEnd = moment.utc(this.ended, 'YYYY-MM-DD').format('DD MMMM YYYY'),
                chartTitle: String[] = [];
            chartTitle.push(`${formattedStart} - ${formattedEnd}`);
            chartTitle.push(`${this.selectedMetric1.title}: ${formattedTotal.toLocaleString()}`);
            if (this.yUnits2) {
                const formattedTotal2 = this.formatYValues(this.yUnits2, total, true);
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
                    position: 'top'
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
                }
            };
        });
    }
    ngOnInit() {
        this.getDataTypes();
    }
}
