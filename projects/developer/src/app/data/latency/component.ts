import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';

import { ChartService } from '../metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ThemeService } from '../../theme/theme.service';
import { ColorService } from '../../common/services/color.service';
import { UIChart } from 'primeng/chart';
import { UTCDates } from '../../common/utils/utcdates';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'dev-job-latency',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobLatencyComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('chart', {static: true}) chart: UIChart;
    startDate: any = moment().subtract(1, 'M').startOf('d').toDate();
    endDate: any = moment().startOf('d').toDate();

    showChart = false;
    showFilters = true;
    jobTypes: any = [];
    selectedJobTypeId = -1;
    dataTypesLoading = true;
    selectedMetrics = false;
    chartLoading = true;
    data: any = {};
    options: any;
    subscriptions: Subscription[] = [];
    titleLookup = {
        'Job Task Time (Avg)': 'Job Time (ms)',
        'other_time_avg': 'Overhead Time (ms)',
        'duration': 'Ingest Time (ms)'
    };

    // utc versions of internal start and end dates
    get utcStartDate(): Date { return UTCDates.localDateToUTC(this.startDate); }
    get utcEndDate(): Date { return UTCDates.localDateToUTC(this.endDate); }

    constructor(
        private jobTypesApiService: JobTypesApiService,
        private chartService: ChartService,
        private messageService: MessageService,
        private themeService: ThemeService,
        private metricsApiService: MetricsApiService) {}

    private updateChart(favorite?: any) {
        this.chartLoading = true;
        this.showChart = true;

        const started = this.utcStartDate.toISOString();
        const ended = this.utcEndDate.toISOString();
        const jobType = this.jobTypes.find(jt => jt.value === this.selectedJobTypeId);

        if (jobType === undefined) { return; }

        const chartParams = {
            choice_id: jobType.value, // choiceIds
            column: ['duration', 'job_time_avg', 'other_time_avg'],
            colors: [
                { column: 'job_time_avg', color: ColorService.COMPLETED },
                { column: 'other_time_avg', color: ColorService.FAILED },
                { column: 'duration', color: ColorService.BLOCKED },
            ],
            dataType: 'job-types',
            started,
            ended,
            group: ['overview'],
            page: 1,
            page_size: null
        };
        const avgRuntimeParams = {
            choice_id: jobType.value, // choiceIds
            column: ['job_time_avg', 'other_time_avg'],
            dataType: 'job-types',
            started,
            ended,
            group: 'overview',
            page: 1,
            page_size: null
        };

        const durationParams = {
            choice_id: jobType.value, // choiceIds
            column: ['duration'],
            dataType: 'job-types',
            started,
            ended,
            group: 'overview',
            page: 1,
            page_size: null
        };
        const yAxes = [{
            id: 'yAxis1',
            position: 'left',
            stacked: true,
            ticks: {
                fontColor: null
            },
            scaleLabel: {
                display: true,
                labelString: 'Avg Run Time (ms)'
            }
        }];

        const avgRuntimeSub = this.metricsApiService.getAvgRuntimeData(avgRuntimeParams);
        const durationSub = this.metricsApiService.getDurationData(durationParams);

        this.subscriptions.push(forkJoin([avgRuntimeSub, durationSub]).subscribe((all_data: any) => {
            const data = all_data[0];

            // We don't care about any of the other information in the data dictionary.
            data.results = data.results.concat(all_data[1].results);
            data.count += all_data[1].count;

            _.forEach(data.results, (result) => {
                if (this.titleLookup[result.column.title]) {
                    result.column.title = this.titleLookup[result.column.title];
                }
            });

            this.chartLoading = false;
            jobType.vstack = true;

            const chartData = this.chartService.formatPlotResults(data, chartParams, [jobType], jobType.label, false);
            chartData.labels = _.map(chartData.labels, label => {
                return label;
            });
            // initialize chart
            this.data = {
                labels: chartData.labels,
                datasets: _.reverse(chartData.data) // failed comes back first, so reverse the data array
            };
            this.options = {
                legend: {
                    display: false,
                    labels: {
                        fontColor: null
                    }
                },
                plugins: {
                    datalabels: {
                        color: 'white',
                        display: context => {
                            const max: any = _.max(context.dataset.data);
                            return (context.dataset.data[context.dataIndex] / max) > 0.15;
                        },
                        font: {
                            weight: 'bold',
                            family: 'FontAwesome',
                            style: 'normal'
                        },
                        formatter: (value, context) => {
                            return context.dataset.icon;
                        }
                    }
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            displayFormats: {
                                hour: 'DD MMM HHmm[Z]'
                            }
                        },
                        ticks: {
                            callback: (value, index, values) => {
                                if (!values[index]) {
                                    return;
                                }
                                return moment.utc(values[index]['value']).format('DD MMM HHmm[Z]');
                            }
                        },
                        stacked: true,
                        fontColor: null
                    }],
                    yAxes: yAxes
                },
                maintainAspectRatio: false
            };

            const colorText = this.themeService.getProperty('--main-text');
            this.options.legend.labels.fontColor = colorText;
            this.options.scales.yAxes[0].ticks.fontColor = colorText;
            this.options.scales.xAxes[0].ticks.fontColor = colorText;

            this.chartLoading = false;
        }, err => {
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job history', detail: err.statusText});
        }));
    }

    changeJobTypeSelection() {
        this.selectedMetrics = true;
    }

    ngAfterViewInit() {
        if (this.chart.chart) {
            this.chart.chart.canvas.parentNode.style.height = '360px';
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    ngOnInit() {
        const updateChartColors = () => {
            if (this.options === undefined) {
                return;
            }

            const colorText = this.themeService.getProperty('--main-text');
            this.options.legend.labels.fontColor = colorText;
            this.options.scales.yAxes[0].ticks.fontColor = colorText;
            this.options.scales.xAxes[0].ticks.fontColor = colorText;

            setTimeout(() => {
                this.chart.reinit();
            });
        };

        this.subscriptions.push(this.themeService.themeChange.subscribe(() => {
            updateChartColors();
        }));

        this.subscriptions.push(this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = [];

            _.forEach(data.results, (result) => {
                this.jobTypes.push({
                    title: result.title,
                    name: result.title,
                    version: result.version,
                    label: result.title,
                    value: result.id
                });
            });
            this.dataTypesLoading = false;
        }));
    }
}
