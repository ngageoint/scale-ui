import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';

import { ChartService } from '../metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ColorService } from '../../common/services/color.service';
import { UIChart } from 'primeng/chart';
import { UTCDates } from '../../common/utils/utcdates';

@Component({
    selector: 'dev-job-latency',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobLatencyComponent implements OnInit, AfterViewInit {

    @ViewChild('chart', {static: true}) chart: UIChart;
    startDate: any = moment().subtract(1, 'M').startOf('d').toDate();
    endDate: any = moment().startOf('d').toDate();
    chartParams1 = {
        ingest: {
            sub: 'getDurationData',
            columns: ['duration'],
            label: 'Ingest Time (Avg)'
        },
        runTime: {
            sub: 'getAvgRuntimeData',
            columns1: ['job_time_avg', 'other_time_avg'],
            columns2: ['duration'],
            label: 'Run Time (Avg)'
        }
    };
    params1: any = {};
    params2: any = {};
    chartParams: any = {};

    showChart = false;
    showFilters = true;
    jobTypes: any = [];
    selectedJobTypeId = -1;
    dataTypesLoading = true;
    selectedMetrics = false;
    chartLoading = true;
    data: any = {};
    options: any = {};

    // utc versions of internal start and end dates
    get utcStartDate(): Date { return UTCDates.localDateToUTC(this.startDate); }
    get utcEndDate(): Date { return UTCDates.localDateToUTC(this.endDate); }

    constructor(
        private jobTypesApiService: JobTypesApiService,
        private chartService: ChartService,
        private messageService: MessageService,
        private metricsApiService: MetricsApiService) {
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            _.forEach(data.results, (result) => {
                result.label = result.title;
                result.value = result.id;
            });
            this.jobTypes = data.results;
            this.dataTypesLoading = false;
        });
    }

    private updateChart(favorite?: any) {
        this.chartLoading = true;
        this.showChart = true;

        let started = this.utcStartDate.toISOString();
        let ended = this.utcEndDate.toISOString();

        const numDays = moment.utc(ended, 'YYYY-MM-DDTHH:mm:ss.SSSZ').diff(moment.utc(started,
            'YYYY-MM-DDTHH:mm:ss.SSSZ'), 'd');
        if (numDays === 1 ) {
            started = moment.utc(started, 'YYYY-MM-DDTHH:mm:ss.SSSZ').startOf('days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            ended = moment.utc(ended, 'YYYY-MM-DDTHH:mm:ss.SSSZ').startOf('days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        }

        const jobType = this.jobTypes.find(jt => jt.id === this.selectedJobTypeId);

        if (jobType === undefined) { return; }

        this.chartParams = {
            choice_id: jobType.id, // choiceIds
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
        this.params1 = {
            choice_id: jobType.id, // choiceIds
            column: ['job_time_avg', 'other_time_avg'],
            dataType: 'job-types',
            started,
            ended,
            group: 'overview',
            page: 1,
            page_size: null
        };

        this.params2 = {
            choice_id: jobType.id, // choiceIds
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
            scaleLabel: {
                display: true,
                labelString: 'Avg Run Time (ms)'
            }
        }];
        const ms1 = this.metricsApiService.getAvgRuntimeData(this.params1);
        const ms2 = this.metricsApiService.getDurationData(this.params2);
        forkJoin([ms1, ms2]).subscribe((pre_data: any) => {
            const data = pre_data[0];
            data.results = data.results.concat(pre_data[1].results);
            data.count += pre_data[1].count;
            this.chartLoading = false;
            jobType.nostack = true;
            const filters = [jobType];
            let title = '';
            if (favorite) {
                title = 'for ' + 'something';
            } else {
                title = '';
            }
            const chartData = this.chartService.formatPlotResults(data, this.chartParams, filters, title, false);
            chartData.labels = _.map(chartData.labels, label => {
                return moment.utc(label, 'YYYY-MM-DDTHH:mm:ss').format('DD MMM HHmm[Z]');
            });
            // initialize chart
            this.data = {
                labels: chartData.labels,
                datasets: _.reverse(chartData.data) // failed comes back first, so reverse the data array
            };
            this.options = {
                legend: {
                    display: false
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
                        stacked: true
                    }],
                    yAxes: yAxes
                },
                maintainAspectRatio: false
            };
            this.chartLoading = false;
        }, err => {
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job history', detail: err.statusText});
        });
    }

    changeJobTypeSelection() {
        this.selectedMetrics = true;
    }

    ngAfterViewInit() {
        if (this.chart.chart) {
            this.chart.chart.canvas.parentNode.style.height = '360px';
        }
    }

    ngOnInit() {
    }
}
