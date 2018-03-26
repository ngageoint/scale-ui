import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';
import * as moment from 'moment';

import { MetricsApiService } from './api.service';
import { ChartService } from './chart.service';
import { DataService } from '../../data.service';
import { UIChart } from 'primeng/primeng';

@Component({
    selector: 'app-metrics',
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
    selectedDataTypeOptions: any[] = [];
    dataTypeFilterText = '';
    filteredChoices: any[] = [];
    filteredChoicesOptions: any[] = [];
    filteredChoicesLoading: boolean;
    columns: any[] = [];
    metricOptions: SelectItem[] = [];
    selectedMetric1: any;
    selectedMetric2: any;
    chartTypes: SelectItem[];
    selectedChartType: any;
    yUnits1: any;
    yUnits2: any;
    multiAxis: boolean;
    data: any;
    options: any;
    showFilters = true;
    constructor(
        private messageService: MessageService,
        private metricsApiService: MetricsApiService,
        private chartService: ChartService,
        private dataService: DataService
    ) {
        this.chartTypes = [
            {
                label: 'Line',
                value: 'line'
            },
            {
                label: 'Bar',
                value: 'bar'
            }
        ];
        this.selectedChartType = 'line';
    }

    private formatYValues(units, data, noPadding?) {
        noPadding = noPadding || false;
        if (units === 'seconds') {
            const r = this.dataService.calculateDuration(moment.utc().startOf('d'), moment.utc().startOf('d').add(data, 's'), noPadding);
            return r;
        } else if (units === 'bytes') {
            return this.dataService.calculateFileSizeFromBytes(data, 1);
        }
        return data;
    }

    getDataTypes() {
        this.dataTypesLoading = true;
        this.metricsApiService.getDataTypes().then((data) => {
            this.dataTypesLoading = false;
            _.forEach(data.results, (result) => {
                this.availableDataTypes.push({
                    label: result.title,
                    value: result
                });
            });
        }).catch(err => {
            this.dataTypesLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving data types', detail: err.statusText});
        });
    }
    getDataTypeOptions() {
        this.filteredChoicesLoading = true;
        this.metricsApiService.getDataTypeOptions(this.selectedDataType.name).then((result) => {
            this.filteredChoicesLoading = false;
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
        }).catch(err => {
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
        if (_.isEqual(this.selectedMetric1, this.selectedMetric2)) {
            this.messageService.add({severity: 'warning', summary: 'Selected the same metric twice'});
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

        if (this.selectedMetric2 && this.multiAxis) {
            // user selected a second metric; another axis is needed
            yAxes.push({
                id: 'yAxis2',
                position: 'left',
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
            page: 1,
            page_size: null,
            started: moment.utc(this.started).toISOString(),
            ended: moment.utc(this.ended).toISOString(),
            choice_id: _.map(this.filtersApplied, 'id'),
            column: this.selectedMetric2 ? [this.selectedMetric1.name, this.selectedMetric2.name] : this.selectedMetric1.name,
            group: this.selectedMetric2 ? [this.selectedMetric1.group, this.selectedMetric2.group] : this.selectedMetric1.group,
            dataType: this.selectedDataType.name
        };
        this.metricsApiService.getPlotData(params).then((data) => {
            const chartData = this.chartService.formatPlotResults(
                data,
                params,
                this.filtersApplied,
                this.selectedDataType.title,
                this.multiAxis,
                this.selectedMetric1,
                this.selectedMetric2,
                this.selectedChartType
            );

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
        }).catch(err => {
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving plot data', detail: err.statusText});
        });
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
