import { Component, OnInit } from '@angular/core';
import { HttpModule } from '@angular/http';
import * as moment from 'moment';
import * as _ from 'lodash';

import { DashboardJobsService } from '../jobs.service';
import { ChartService } from '../../data/metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ColorService } from '../../color.service';

@Component({
    selector: 'app-historychart',
    templateUrl: './historychart.component.html',
    styleUrls: ['./historychart.component.scss']
})
export class HistorychartComponent implements OnInit {
    data: any;
    options: any;
    params: any;
    favorites = [];
    activeJobs = [];

    constructor(
        private http: HttpModule,
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
            started: moment.utc().subtract(1, 'w').format('YYYY-MM-DD'),
            ended: moment.utc().format('YYYY-MM-DD'),
            group: ['overview', 'overview'],
            page: null,
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
            scaleLabel: {
                display: true,
                labelString: 'Failed Count'
            }
        }];
        this.metricsApiService.getPlotData(this.params).then(data => {
            const filters = this.favorites.length > 0 ? this.favorites : _.map(this.activeJobs, 'job_type');
            const colors = [this.colorService.COMPLETED, this.colorService.ERROR];
            const chartData = this.chartService.formatPlotResults(data, this.params, filters, '', colors);
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
                }
            };
        });
    }

    ngOnInit() {
        this.updateChart();
        this.jobsService.favoritesUpdated.subscribe(() => {
            this.updateChart();
        });
    }
}
