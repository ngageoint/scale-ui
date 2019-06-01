import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { UIChart } from 'primeng/primeng';
import * as moment from 'moment';
import * as _ from 'lodash';

import { IngestApiService } from '../../data/ingest/api.service';
import { DashboardJobsService } from '../jobs.service';
import { ChartService } from '../../data/metrics/chart.service';
import { MetricsApiService } from '../../data/metrics/api.service';
import { ColorService } from '../../common/services/color.service';
import { JobsApiService } from '../../processing/jobs/api.service';

@Component({
    selector: 'dev-data-feed',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DataFeedComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    @Input() dateRange: string;
    @ViewChild('chart') chart: UIChart;
    chartLoading: boolean;
    feedParams: any;
    plotParams: any;
    data: any;
    options: any;
    feedDataset: any;
    jobsDatasets = [];
    filesDataset: any;
    dataFeeds: SelectItem[] = [];
    selectedDataFeed: any;
    favorites = [];
    allJobs = [];
    feedSubscription: any;
    jobSubscription: any;
    favoritesSubscription: any;
    started: string;
    ended: string;

    private FEED_DATA = 'scale.dashboard.selectedDataFeed';

    constructor(
        private messageService: MessageService,
        private ingestApiService: IngestApiService,
        private jobsService: DashboardJobsService,
        private chartService: ChartService,
        private metricsApiService: MetricsApiService,
        private jobsApiService: JobsApiService,
    ) {
        this.feedDataset = {
            data: []
        };
    }

    private updateFeedData() {
        if (this.selectedDataFeed) {
            this.feedDataset = {
                label: this.selectedDataFeed.strike.title,
                fill: false,
                borderColor: ColorService.INGEST,
                backgroundColor: ColorService.INGEST,
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: ColorService.INGEST,
                data: []
            };
            _.forEach(this.selectedDataFeed.values, value => {
                this.feedDataset.data.push({
                    x: value.time,
                    y: value.files
                });
            });
            const datasets = this.filesDataset ? [this.feedDataset, this.filesDataset] : [this.feedDataset];
            this.data = {
                datasets: this.jobsDatasets.length > 0 ? _.concat(datasets, this.jobsDatasets) : datasets
            };
        } else {
            this.data = {
                datasets: this.jobsDatasets
            };
        }
    }

    private fetchJobsData(job_type_name: string, job_type_version: string, chartData: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.jobsApiService.getJobs({
                sortField: 'last_status_change',
                started: this.started,
                ended: this.ended,
                rows: 1000,
                status: 'COMPLETED',
                job_type_name: job_type_name,
                job_type_version: job_type_version
            }).subscribe(jobData => {
                const format = this.dateRange === 'days' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
                const unit = this.dateRange === 'days' ? 'd' : 'h';
                _.forEach(chartData.labels, label => {
                    const sortedData = _.filter(jobData.results, result => {
                        return moment.utc(result.last_status_change).isBetween(
                            moment.utc(label, format),
                            moment.utc(label, format).add(1, unit)
                        );
                    });
                    chartData.data[0].data.push({
                        x: moment.utc(label, format).format(format),
                        y: sortedData.length
                    });
                });
                chartData.data[0].fill = true;
                chartData.data[0].type = 'line';
                chartData.data[0].yAxisID = 'yAxis1';
                chartData.data[0].pointBorderColor = '#fff';
                chartData.data[0].borderColor = '#d0eaff';
                console.log(chartData);
                resolve(chartData);
            }, err => {
                reject(err);
            });
        });
    }

    private fetchChartData(initDataFeeds: boolean) {
        this.chartLoading = true;
        this.unsubscribe();
        this.feedParams = {
            started: this.started,
            ended: this.ended,
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
            if (this.dataFeeds.length > 0) {
                if (this.selectedDataFeed) {
                    // use value from dataFeeds array to ensure object equality for primeng dropdown
                    const dataFeed: any = _.find(this.dataFeeds, { label: this.selectedDataFeed.strike.title });
                    this.selectedDataFeed = dataFeed ? dataFeed.value : this.dataFeeds[0].value;
                } else {
                    this.selectedDataFeed = this.dataFeeds[0].value;
                }
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
                    { column: 'completed_count', color: ColorService.SCALE_BLUE2 }
                ],
                dataType: 'job-types',
                started: this.started,
                ended: this.ended,
                group: ['overview'],
                page: 1,
                page_size: null
            };

            const filters = this.favorites.length > 0 ?
                this.favorites :
                [];
            const format = this.dateRange === 'days' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
            const chartData = this.chartService.formatPlotResults(
                { results: [
                    {
                        column: {
                            title: 'Completed Count',
                            name: 'completed_count'
                        },
                        min_x: moment.utc(this.started).format(format),
                        max_x: moment.utc(this.ended).format(format),
                        min_y: 1,
                        max_y: 1000,
                        values: []
                    }
                ]},
                this.plotParams,
                filters,
                '',
                true,
                null,
                null,
                null,
                null,
                this.dateRange
            );
            chartData.data = [
                {
                    data: []
                }
            ];
            const promises = [];

            // get completed counts for the current day
            // need to use the jobs api for this, since metrics only does 1 full day at a time
            if (filters.length > 0) {
                _.forEach(filters, f => {
                    promises.push(this.fetchJobsData(f.name, f.version, chartData));
                });
            } else {
                promises.push(this.fetchJobsData(null, null, chartData));
            }
            Promise.all(promises).then(values => {
                // use unique objects from data arrays
                this.jobsDatasets = _.uniq(_.flatten(_.map(values, 'data')));
                this.updateFeedData();
                this.chartLoading = false;
                // if (this.favorites && this.favorites.length > 0) {
                //     this.filesApiService.getFiles({
                //         page: 1,
                //         modified_started: moment.utc().subtract(3, 'd').startOf('d').toISOString(),
                //         modified_ended: moment.utc().add(1, 'd').startOf('d').toISOString(),
                //         job_type_id: _.map(this.favorites, 'id'),
                //         sortOrder: 1,
                //         sortField: 'created'
                //     }).subscribe(filesData => {
                //         this.filesDataset = {
                //             label: 'Files',
                //             fill: false,
                //             borderColor: ColorService.WARNING,
                //             backgroundColor: ColorService.WARNING,
                //             borderWidth: 2,
                //             pointRadius: 2,
                //             pointBackgroundColor: ColorService.WARNING,
                //             data: []
                //         };
                //         const files = _.toPairs(_.groupBy(filesData.results, r => {
                //             return moment.utc(r.created).startOf('d').toISOString();
                //         }));
                //         _.forEach(files, f => {
                //             this.filesDataset.data.push({
                //                 x: f[0],
                //                 y: f[1].length
                //             });
                //         });
                //         this.updateFeedData();
                //         this.chartLoading = false;
                //     });
                // } else {
                //     this.updateFeedData();
                //     this.chartLoading = false;
                // }
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
                    stacked: true,
                    ticks: {
                        suggestedMin: 0
                    },
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

    ngOnChanges(changes: SimpleChanges) {
        this.started = changes.dateRange.currentValue === 'hours' ?
            moment.utc().subtract(1, 'd').toISOString() :
            moment.utc().subtract(1, 'w').toISOString();
        this.ended = moment.utc().toISOString();

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
}
