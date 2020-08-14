import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { UIChart } from 'primeng/chart';
import * as moment from 'moment';
import * as _ from 'lodash';

import { IngestApiService } from '../../data/ingest/api.service';
import { ColorService } from '../../common/services/color.service';
import { ThemeService } from '../../theme/theme.service';


@Component({
    selector: 'dev-data-feed',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DataFeedComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    @Input() started;
    @Input() ended;
    @ViewChild('chart', {static: true}) chart: UIChart;
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
    allJobs = [];
    feedSubscription: any;
    jobSubscription: any;
    themeSubscription: any;
    jobParams: any;
    chartData: any;

    private FEED_DATA = 'scale.dashboard.selectedDataFeed';

    constructor(
        private messageService: MessageService,
        private ingestApiService: IngestApiService,
        private themeService: ThemeService
    ) {
        this.feedDataset = {
            data: []
        };
        this.chartData = {
            ingest: {},
            data: {}
        };
    }

    private updateText() {
        const initialTheme = this.themeService.getActiveTheme().name;
        let initialTextColor = ColorService.FONT_LIGHT_THEME; // default
        switch (initialTheme) {
            case 'dark':
                initialTextColor = ColorService.FONT_DARK_THEME;
                break;
        }
        this.options.legend.labels.fontColor = initialTextColor;
        this.options.scales.yAxes[0].ticks.fontColor = initialTextColor;
        this.options.scales.yAxes[0].scaleLabel.fontColor = initialTextColor;
        this.options.scales.xAxes[0].ticks.fontColor = initialTextColor;

        this.unsubscribe();
        this.themeSubscription = this.themeService.themeChange.subscribe(theme => {
                let textColor = ColorService.FONT_LIGHT_THEME; // default
                switch (theme.name) {
                    case 'dark':
                        textColor = ColorService.FONT_DARK_THEME;
                        break;
                }
                this.options.legend.labels.fontColor = textColor;
                this.options.scales.yAxes[0].ticks.fontColor = textColor;
                this.options.scales.yAxes[0].scaleLabel.fontColor = textColor;
                this.options.scales.xAxes[0].ticks.fontColor = textColor;
                setTimeout(() => {
                    this.chart.reinit();
                }, 100);
            }
        );
    }

    private updateFeedData() {
        if (this.selectedDataFeed) {
            this.ingestDataset = {
                label: 'Ingest Time',
                fill: true,
                borderColor: ColorService.INGEST,
                backgroundColor: ColorService.getRgba(ColorService.INGEST, .25),
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: ColorService.INGEST,
                data: []
            };
            _.forEach(this.chartData.ingest.values, value => {
                this.ingestDataset.data.push({
                    x: value.time,
                    y: value.files
                });
            });
            this.feedDataset = {
                label: 'Data Time',
                fill: true,
                borderColor: ColorService.COMPLETED,
                backgroundColor: ColorService.getRgba(ColorService.COMPLETED, .5),
                borderWidth: 2,
                pointRadius: 2,
                pointBackgroundColor: ColorService.COMPLETED,
                data: []
            };
            _.forEach(this.chartData.data.values, value => {
                this.feedDataset.data.push({
                    x: value.time,
                    y: value.files
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
            started: this.started,
            ended: this.ended
        };
        this.feedSubscription = this.ingestApiService.getIngestStatus(this.feedParams, true).subscribe(data => {
            this.dataFeeds = [];
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
                    const dataFeed: any = _.find(this.dataFeeds, { label: this.selectedDataFeed.value.strike.title });
                    this.selectedDataFeed = dataFeed ? dataFeed : this.dataFeeds[0];
                    this.chartData.data = dataFeed ? dataFeed.value : this.dataFeeds[0].value;
                } else {
                    this.selectedDataFeed = this.dataFeeds[0];
                    this.chartData.data = this.dataFeeds[0].value;
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
            started: this.started,
            ended:  this.ended,
            use_ingest_time: true
        };
        this.feedSubscription = this.ingestApiService.getIngestStatus(this.feedParams, true).subscribe(data => {
          this.ingestFeeds = [];
            if (initDataFeeds) {
                _.forEach(data.results, result => {
                    this.ingestFeeds.push({
                        label: result.strike.title,
                        value: result
                    });
                });
            }
            if (this.ingestFeeds.length > 0) {
                if (this.selectedDataFeed) {
                    // use value from dataFeeds array to ensure object equality for primeng dropdown
                    const ingestFeed: any = _.find(this.ingestFeeds, { label: this.selectedDataFeed.value.strike.title });
                    // this.selectedDataFeed = ingestFeed ? ingestFeed : this.ingestFeeds[0];
                    this.chartData.ingest = ingestFeed ? ingestFeed.value : this.ingestFeeds[0].value;
                } else {
                    this.selectedDataFeed = this.ingestFeeds[0];
                    this.chartData.ingest = this.ingestFeeds[0].value;
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
        const storedDataFeed = localStorage.getItem(this.FEED_DATA);
        if (storedDataFeed) {
            this.selectedDataFeed =  JSON.parse(storedDataFeed);
        }
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
                        suggestedMin: 0,
                        beginAtZero: true,

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
            },
            tooltips: {
                mode: 'index'
            }
        };
        this.updateText();
        this.fetchChartData(true);
    }

    ngAfterViewInit() {
        if (this.chart.chart) {
            this.chart.chart.canvas.parentNode.style.height = '325px';
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
        if (this.themeSubscription) {
            this.themeSubscription.unsubscribe();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.fetchChartData(true);
    }
}
