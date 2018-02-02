import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { DashboardJobsService } from '../jobs.service';
import { ChartService } from '../../data/metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ColorService } from '../../color.service';
import { UIChart } from 'primeng/primeng';

@Component({
    selector: 'app-job-history',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chart') chart: UIChart;
    data: any;
    options: any;
    params: any;
    favorites = [];
    activeJobs = [];
    subscription: any;

    constructor(
        private jobsService: DashboardJobsService,
        private chartService: ChartService,
        private metricsApiService: MetricsApiService,
        private colorService: ColorService
    ) {}

    private updateChart() {
        this.favorites = this.jobsService.getFavorites();
        this.activeJobs = this.jobsService.getActiveJobs();
        const choiceIds = this.favorites.length > 0 ? _.map(this.favorites, 'id') : _.map(this.activeJobs, 'job_type.id');

        this.params = {
            choice_id: choiceIds,
            column: ['completed_count', 'failed_count'],
            dataType: 'job-types',
            started: moment.utc().subtract(1, 'w').toISOString(),
            ended: moment.utc().toISOString(),
            group: ['overview', 'overview'],
            page: 1,
            page_size: null
        };
        const yAxes = [{
            id: 'yAxis1',
            position: 'left',
            stacked: true,
            scaleLabel: {
                display: true,
                labelString: 'Completed Count'
            }
        }, {
            id: 'yAxis2',
            position: 'right',
            stacked: true,
            gridLines: {
                drawOnChartArea: false
            },
            scaleLabel: {
                display: true,
                labelString: 'Failed Count'
            }
        }];
        this.metricsApiService.getPlotData(this.params).then(data => {
            const filters = this.favorites.length > 0 ? this.favorites : _.map(this.activeJobs, 'job_type');
            const colors = [this.colorService.SCALE_BLUE2, this.colorService.ERROR];
            const chartData = this.chartService.formatPlotResults(data, this.params, filters, '', colors);
            chartData.labels = _.map(chartData.labels, label => {
                return moment.utc(label, 'YYYY-MM-DD').format('DD MMM');
            });
            // initialize chart
            this.data = {
                labels: chartData.labels,
                datasets: chartData.data
            };
            this.options = {
                legend: {
                    display: false
                },
                plugins: {
                    datalabels: {
                        color: 'white',
                        display: context => {
                            return context.dataset.data[context.dataIndex] > 15;
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
        });
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.updateChart();
        this.subscription = this.jobsService.favoritesUpdated.subscribe(() => {
            this.updateChart();
        });
    }

    ngAfterViewInit() {
        if (this.chart.chart) {
            this.chart.chart.canvas.parentNode.style.height = '33vh';
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
