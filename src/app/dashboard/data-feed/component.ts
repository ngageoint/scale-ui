import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { UIChart } from 'primeng/primeng';
import * as moment from 'moment';
import * as _ from 'lodash';

import { IngestApiService } from '../../data/ingest/api.service';
import { DashboardJobsService } from '../jobs.service';
import { ChartService } from '../../data/metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ColorService } from '../../color.service';
import { JobsApiService } from '../../processing/jobs/api.service';
import { JobsDatatable } from '../../processing/jobs/datatable.model';

@Component({
    selector: 'app-data-feed',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DataFeedComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chart') chart: UIChart;
    chartLoading: boolean;
    feedParams: any;
    plotParams: any;
    data: any;
    options: any;
    feedDataset: any;
    jobsDatasets = [];
    dataFeeds: SelectItem[] = [];
    selectedDataFeed: any;
    favorites = [];
    allJobs = [];
    feedSubscription: any;
    jobSubscription: any;
    favoritesSubscription: any;
    jobParams: any;

    private FEED_DATA = 'scale.dashboard.selectedDataFeed';

    constructor(
        private messageService: MessageService,
        private ingestApiService: IngestApiService,
        private jobsService: DashboardJobsService,
        private chartService: ChartService,
        private metricsApiService: MetricsApiService,
        private colorService: ColorService,
        private jobsApiService: JobsApiService
    ) {
        this.feedDataset = {
            data: []
        };
    }

    private updateFeedData() {
        this.feedDataset = {
            label: this.selectedDataFeed.strike.title,
            fill: false,
            borderColor: this.colorService.INGEST,
            borderWidth: 2,
            pointRadius: 2,
            pointBackgroundColor: this.colorService.INGEST,
            data: []
        };
        _.forEach(this.selectedDataFeed.values, value => {
            this.feedDataset.data.push({
                x: value.time,
                y: value.files
            });
        });
        this.data = {
            datasets: this.jobsDatasets.length > 0 ? _.concat([this.feedDataset], this.jobsDatasets) : [this.feedDataset]
        };
    }

    private fetchChartData(initDataFeeds: boolean) {
        this.chartLoading = true;
        this.unsubscribe();
        this.feedParams = {
            started: moment.utc().subtract(3, 'd').toISOString(),
            ended: moment.utc().toISOString(),
            use_ingest_time: true
        };
        this.feedSubscription = this.ingestApiService.getIngestStatus(this.feedParams, true).subscribe(data => {
            if (initDataFeeds) {
                _.forEach(data.results, result => {
                    this.dataFeeds.push({
                        label: result.strike.title,
                        value: result
                    });
                });
                this.dataFeeds = _.sortBy(this.dataFeeds, ['asc'], ['label']);
            }
            if (this.selectedDataFeed) {
                // use value from dataFeeds array to ensure object equality for primeng dropdown
                const dataFeed = _.find(this.dataFeeds, { label: this.selectedDataFeed.strike.title });
                this.selectedDataFeed = dataFeed ? dataFeed.value : this.dataFeeds[0].value;
            } else {
                this.selectedDataFeed = this.dataFeeds[0].value;
            }

            // get jobs metrics
            this.favorites = this.jobsService.getFavorites();
            this.allJobs = this.jobsService.getAllJobs();
            const choiceIds = this.favorites.length > 0 ?
                _.map(this.favorites, 'id') :
                [];

            this.plotParams = {
                choice_id: choiceIds,
                column: ['completed_count'],
                colors: [
                    { column: 'completed_count', color: this.colorService.SCALE_BLUE2 }
                ],
                dataType: 'job-types',
                started: moment.utc().subtract(3, 'd').toISOString(),
                ended: moment.utc().add(1, 'd').toISOString(),
                group: ['overview'],
                page: 1,
                page_size: null
            };

            this.metricsApiService.getPlotData(this.plotParams).then(plotData => {
                const filters = this.favorites.length > 0 ?
                    this.favorites :
                    [];
                const chartData = this.chartService.formatPlotResults(plotData, this.plotParams, filters, '', true);

                // refactor data to match this chart's format
                _.forEach(chartData.data, d1 => {
                    const newData = [];
                    _.forEach(d1.data, (d2, idx) => {
                        newData.push({
                            x: moment.utc(chartData.labels[idx], 'YYYY-MM-DD').toISOString(),
                            y: d2
                        });
                    });
                    d1.data = newData;
                    d1.pointBorderColor = '#fff';
                    d1.borderColor = '#d0eaff';
                    // get completed counts for the current day
                    // need to use the jobs api for this, since metrics only does 1 full day at a time
                    this.jobsApiService.getJobs({
                        started: moment.utc().startOf('d').toISOString(),
                        ended: moment.utc().add(1, 'h').startOf('h').toISOString(),
                        status: 'COMPLETED',
                        job_type_id: d1.id
                    }).then(jobData => {
                        const chartDataIdx = _.indexOf(chartData.data, _.find(chartData.data, { id: d1.id }));
                        // remove last element, since that will always have a 0 count
                        chartData.data[chartDataIdx].data.pop();
                        // add counts for today from jobData
                        chartData.data[chartDataIdx].data.push({
                            x: moment.utc().toISOString(),
                            y: jobData.count
                        });
                        this.jobsDatasets = chartData.data;
                        this.updateFeedData();
                        this.chartLoading = false;
                    });
                });
            });
        }, err => {
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving ingest status', detail: err.statusText});
        });
    }

    onDataFeedSelect() {
        localStorage.setItem(this.FEED_DATA, JSON.stringify(this.selectedDataFeed));
        this.updateFeedData();
    }

    unsubscribe() {
        if (this.feedSubscription) {
            this.feedSubscription.unsubscribe();
        }
        if (this.jobSubscription) {
            this.jobSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.data = {
            datasets: []
        };
        this.options = {
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
                    }
                }],
                yAxes: [{
                    id: 'yAxis2',
                    position: 'left',
                    scaleLabel: {
                        display: true,
                        labelString: 'Ingest Rate'
                    }
                }, {
                    id: 'yAxis1',
                    position: 'right',
                    gridLines: {
                        drawOnChartArea: false
                    },
                    stacked: false,
                    scaleLabel: {
                        display: true,
                        labelString: 'Completed Count'
                    }
                }]
            },
            plugins: {
                datalabels: false
            },
            maintainAspectRatio: false,
            legend: {
                labels: {
                    boxWidth: 10,
                    fontFamily: 'FontAwesome',
                    generateLabels: (chart) => {
                        const data = chart.data;
                        return Array.isArray(data.datasets) ? _.map(data.datasets, (dataset, i) => {
                            return {
                                text: dataset.icon ? dataset.icon : 'Ingest Rate',
                                fillStyle: dataset.backgroundColor,
                                hidden: !chart.isDatasetVisible(i),
                                lineCap: dataset.borderCapStyle,
                                lineDash: dataset.borderDash,
                                lineDashOffset: dataset.borderDashOffset,
                                lineJoin: dataset.borderJoinStyle,
                                lineWidth: dataset.borderWidth,
                                strokeStyle: dataset.borderColor,
                                // Below is extra data used for toggling the datasets
                                datasetIndex: i
                            };
                        }, this) : [];
                    }
                }
            }
        };
        const storedDataFeed = localStorage.getItem(this.FEED_DATA);
        if (storedDataFeed) {
            this.selectedDataFeed = JSON.parse(storedDataFeed);
        }
        this.fetchChartData(true);
        this.favoritesSubscription = this.jobsService.favoritesUpdated.subscribe(() => {
            this.fetchChartData(false);
        });
    }

    ngAfterViewInit() {
        if (this.chart.chart) {
            this.chart.chart.canvas.parentNode.style.height = '325px';
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
        if (this.favoritesSubscription) {
            this.favoritesSubscription.unsubscribe();
        }
    }
}
