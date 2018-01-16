import { Component, OnInit } from '@angular/core';
import { HttpModule } from '@angular/http';
import * as moment from 'moment';
import * as _ from 'lodash';

import { DashboardJobsService } from '../jobs.service';
import { ChartService } from '../../data/metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
// import { ColorService } from '../../color.service';

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
        private metricsApiService: MetricsApiService
        // private colorService: ColorService
    ) {
        // this.data = {
        //     labels: ['08/16/2017', '08/17/2017', '08/18/2017', '08/19/2017', '08/20/2017', '08/21/2017', '08/22/2017'],
        //     datasets: [{
        //         label: 'Completed',
        //         backgroundColor: colorService.COMPLETED,
        //         borderWidth: 0,
        //         data: [165, 159, 180, 181, 156, 155, 140]
        //     }, {
        //         label: 'Data',
        //         backgroundColor: colorService.ERROR_DATA,
        //         borderWidth: 0,
        //         data: [28, 48, 40, 19, 86, 27, 90]
        //     }, {
        //         label: 'Algorithm',
        //         backgroundColor: colorService.ERROR_ALGORITHM,
        //         borderWidth: 0,
        //         data: [28, 48, 40, 19, 86, 27, 90]
        //     }, {
        //         label: 'System',
        //         backgroundColor: colorService.ERROR_SYSTEM,
        //         borderWidth: 0,
        //         data: [28, 48, 40, 19, 86, 27, 90]
        //     }]
        // };
        // this.options = {
        //     tooltips: {
        //         mode: 'index',
        //         intersect: false
        //     },
        //     responsive: true,
        //     scales: {
        //         xAxes: [{
        //             stacked: true,
        //         }],
        //         yAxes: [{
        //             stacked: true
        //         }]
        //     }
        // };
    }

    ngOnInit() {
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
        debugger;
        this.metricsApiService.getPlotData(this.params).then(data => {
            const filters = this.favorites.length > 0 ? this.favorites : _.map(this.activeJobs, 'job_type');
            const chartData = this.chartService.formatPlotResults(data, this.params, filters, '');
            // initialize chart
            this.data = {
                labels: chartData.labels,
                datasets: chartData.data
            };
            this.options = {
                legend: {
                    display: false
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
}
