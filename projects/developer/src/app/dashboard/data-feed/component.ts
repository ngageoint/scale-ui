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
import { DataService } from '../../common/services/data.service';
import { ColorService } from '../../common/services/color.service';
import { JobsApiService } from '../../processing/jobs/api.service';
import { FilesApiService } from '../../common/services/files/api.service';

@Component({
    selector: 'dev-data-feed',
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
    ingestDataset: any;
    jobsDatasets = [];
    filesDataset: any;
    dataFeeds: SelectItem[] = [];
    ingestFeeds: SelectItem[] = [];
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
        private jobsApiService: JobsApiService,
        private filesApiService: FilesApiService
    ) {
        this.feedDataset = {
            data: []
        };
    }

    private updateFeedData() {
        if (this.selectedDataFeed) {
            this.ingestDataset = {
                label: this.selectedDataFeed.ingest.strike.title + ' Ingests',
                fill: true,
                borderColor: ColorService.INGEST,
                backgroundColor: ColorService.getRgba(ColorService.INGEST, .25),
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: ColorService.INGEST,
                data: []
            };
            _.forEach(this.selectedDataFeed.ingest.values, value => {
                this.ingestDataset.data.push({
                    x: value.time,
                    y: value.size
                });
            });
            this.feedDataset = {
                label: this.selectedDataFeed.data.strike.title + ' Data',
                fill: true,
                borderColor: ColorService.COMPLETED,
                backgroundColor: ColorService.getRgba(ColorService.COMPLETED, .5),
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: ColorService.COMPLETED,
                data: []
            };
            _.forEach(this.selectedDataFeed.data.values, value => {
                this.feedDataset.data.push({
                    x: value.time,
                    y: value.size
                });
            });
            const datasets = this.feedDataset ? [this.ingestDataset, this.feedDataset] : [this.ingestDataset];
            this.data = {
                datasets: datasets
            };
        } else {
            this.data = {
                datasets: this.jobsDatasets
            };
        }
    }

    private fetchDataFeed(initDataFeeds: boolean) {
        this.chartLoading = true;
        this.unsubscribe();
        this.feedParams = {
            started: moment.utc().subtract(3, 'd').toISOString(),
            ended: moment.utc().toISOString()
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
            if (this.dataFeeds.length > 0) {
                if (this.selectedDataFeed.data.length > 0) {
                    // use value from dataFeeds array to ensure object equality for primeng dropdown
                    const dataFeed: any = _.find(this.dataFeeds, { label: this.selectedDataFeed.data.strike.title });
                    this.selectedDataFeed.data = dataFeed ? dataFeed.value : this.dataFeeds[0].value;
                } else {
                    this.selectedDataFeed.data = this.dataFeeds[0].value;
                }
            }
            this.updateFeedData();
            this.chartLoading = false;
        }, err => {
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving ingest status', detail: err.statusText});
        });

    }

    private fetchChartData(initDataFeeds: boolean) {
        this.chartLoading = true;
        this.unsubscribe();
        this.feedParams = {
            started: moment.utc().subtract(3, 'd').toISOString(),
            ended: moment.utc().toISOString(),
            use_ingest_time: true
        };
        this.selectedDataFeed = {
            ingest: {},
            data: {}
        };
        this.feedSubscription = this.ingestApiService.getIngestStatus(this.feedParams, true).subscribe(data => {
          this.dataFeeds = [];
            if (initDataFeeds) {
                _.forEach(data.results, result => {
                    this.ingestFeeds.push({
                        label: result.strike.title,
                        value: result
                    });
                });
                this.ingestFeeds = _.sortBy(this.ingestFeeds, ['asc'], ['label']);
            }
            if (this.ingestFeeds.length > 0) {
                if (this.selectedDataFeed.ingest.length > 0) {
                    // use value from dataFeeds array to ensure object equality for primeng dropdown
                    const ingestFeed: any = _.find(this.ingestFeeds, { label: this.selectedDataFeed.ingest.strike.title });
                    this.selectedDataFeed.ingest = ingestFeed ? ingestFeed.value : this.ingestFeeds[0].value;
                } else {
                    this.selectedDataFeed.ingest = this.ingestFeeds[0].value;
                    console.log(this.selectedDataFeed);
                }
            }
            this.fetchDataFeed(initDataFeeds);
        }, err => {
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving ingest status', detail: err.statusText});
        });
    }

    onDataFeedSelect() {
        localStorage.setItem(this.FEED_DATA, JSON.stringify(this.selectedDataFeed));
        this.fetchChartData(true);
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
        this.dataFeeds = [];
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
                        labelString: 'Number of Files'
                    },
                    ticks: {
                        beginAtZero: true,
                        callback: (label, index, labels) => {
                            return DataService.calculateFileSizeFromBytes(label, 0);
                        }
                    }
                }, {
                    id: 'yAxis1',
                    position: 'right',
                    gridLines: {
                        drawOnChartArea: false
                    },
                    stacked: true,
                    ticks: {
                        suggestedMin: 0
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'File Size'
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
                                text: dataset.icon ?
                                    dataset.icon :
                                    dataset.label === this.selectedDataFeed && this.selectedDataFeed.strike.title ?
                                        'Ingest Rate' :
                                        dataset.label,
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
                        }) : [];
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
            // don't duplicate data feeds in dropdown
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
