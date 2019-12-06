import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';

import { DashboardJobsService } from '../jobs.service';
import { ChartService } from '../../data/metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ColorService } from '../../common/services/color.service';
import { UIChart } from 'primeng/primeng';

@Component({
    selector: 'dev-job-history',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() favorite: any;
    @Input() started;
    @Input() ended;
    @ViewChild('chart') chart: UIChart;
    chartLoading: boolean;
    data: any;
    options: any;
    params: any;
    favorites = [];
    allJobs = [];
    favoritesSubscription: any;

    constructor(
        private messageService: MessageService,
        private jobsService: DashboardJobsService,
        private chartService: ChartService,
        private metricsApiService: MetricsApiService
    ) {}

    private updateChart(favorite?: any) {
        this.chartLoading = true;
        this.allJobs = this.jobsService.getAllJobs();
        const choiceIds = this.favorite ?
            this.favorite.job_type.id :
            [];
            this.params = {
                choice_id: choiceIds,
                column: ['completed_count', 'failed_count'],
                colors: [
                    { column: 'completed_count', color: ColorService.SCALE_BLUE2 },
                    { column: 'failed_count', color: ColorService.ERROR }
                ],
                dataType: 'job-types',
                started: this.started,
                ended: this.ended,
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
                labelString: 'Job Count'
            }
        }];
        this.metricsApiService.getPlotData(this.params).subscribe(data => {
            this.chartLoading = false;
            const filters = [];
            let title = '';
            if (favorite) {
                title = 'for ' + favorite.job_type.title;
                filters[0] = favorite.job_type;
            } else {
                title = '';
            }
            const chartData = this.chartService.formatPlotResults(data, this.params, filters, title, false);
            chartData.labels = _.map(chartData.labels, label => {
                return moment.utc(label, 'YYYY-MM-DD').format('DD MMM');
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
        }, err => {
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job history', detail: err.statusText});
        });
    }

    unsubscribe() {
        if (this.favoritesSubscription) {
            this.favoritesSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.chartLoading = true;
        if (this.favorite) {
            this.updateChart(this.favorite);
        } else {
            this.updateChart();
        }
    }

    ngAfterViewInit() {
        if (this.chart.chart) {
            this.chart.chart.canvas.parentNode.style.height = '360px';
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
