import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { IngestApiService } from '../ingest/api.service';
import { StrikesApiService } from '../../system/strikes/api.service';
import { DataService } from '../../common/services/data.service';
import { ColorService } from '../../common/services/color.service';

@Component({
    selector: 'dev-feed',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class FeedComponent implements OnInit, OnDestroy {
    @ViewChild('feedChart') feedChart: any;
    subscription: any;
    chartLoading: boolean;
    options: any;
    data = {
        datasets: []
    };
    strikes: SelectItem[] = [];
    selectedStrikes: any;
    started: any;
    ended: any;
    viewingLatest = true;
    timeValues: SelectItem[] = [{
        label: 'Use Data Time',
        value: 'data'
    }, {
        label: 'Use Ingest Time',
        value: 'ingest'
    }];
    selectedTimeValue: string;
    constructor(
        private ingestApiService: IngestApiService,
        private strikesApiService: StrikesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    private getStrikes() {
        this.strikesApiService.getStrikes().subscribe(data => {
            _.forEach(data.results, strike => {
                this.strikes.push({
                    label: strike.title,
                    value: strike.id
                });
            });
            this.strikes = _.orderBy(this.strikes, ['label'], ['asc']);
            if (!this.selectedStrikes) {
                this.selectedStrikes = [this.strikes[0].value];
            }

            this.getLatestData();
        }, err => {
            console.log(err);
        });
    }

    private unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    getLatestData() {
        this.unsubscribe();

        const params = {
            page_size: 1000,
            use_ingest_time: this.selectedTimeValue === 'ingest'
        };

        if (!this.viewingLatest) {
            params['started'] = moment.utc(this.started, environment.dateFormat).toISOString();
            params['ended'] = moment.utc(this.ended, environment.dateFormat).toISOString();
        }

        this.chartLoading = true;
        this.subscription = this.ingestApiService.getIngestStatus(params, true, 5000).subscribe(data => {
            this.chartLoading = false;
            const allFeeds = _.orderBy(data.results, ['strike_name'], ['asc']);
            const selectedFeeds = _.filter(allFeeds, feed => {
                return _.includes(this.selectedStrikes, feed.strike.id);
            });
            _.forEach(selectedFeeds, (feed, idx) => {
                const returnArr = [];
                _.forEach(feed.values, v => {
                    returnArr.push({
                        x: moment.utc(v.time).format(environment.dateFormat),
                        y: v.size
                    });
                });
                const dataset = _.find(this.data.datasets, { id: feed.strike.id });
                const opacity = parseFloat((1 - (idx / 10) * 2).toFixed(2));
                const bgColor = ColorService.getRgba(ColorService.SCALE_BLUE2, opacity);
                if (dataset) {
                    dataset.backgroundColor = bgColor;
                    dataset.data = returnArr;
                } else {
                    this.data.datasets.push({
                        borderColor: '#d0eaff',
                        backgroundColor: bgColor,
                        borderWidth: 1,
                        pointBackgroundColor: ColorService.SCALE_BLUE2,
                        pointBorderColor: '#fff',
                        pointRadius: 2,
                        // lineTension: 0,
                        id: feed.strike.id,
                        data: returnArr
                    });
                }
            });
            this.feedChart.chart.update();

            const urlParams = {
                use_ingest_time: params.use_ingest_time,
                strike_id: this.selectedStrikes
            };

            this.router.navigate(['/data/feed'], {
                queryParams: urlParams as Params,
                replaceUrl: true
            });
        }, err => {
            console.log(err);
            this.chartLoading = false;
        });
    }

    viewLatest() {
        this.viewingLatest = true;
        this.started = moment.utc().subtract(7, 'd').startOf('d').format(environment.dateFormat);
        this.ended = moment.utc().format(environment.dateFormat);
        this.getLatestData();
    }

    viewOlder() {
        this.viewingLatest = false;
        this.started = moment.utc(this.started, environment.dateFormat).subtract(7, 'd').format(environment.dateFormat);
        this.ended = moment.utc(this.ended, environment.dateFormat).subtract(7, 'd').format(environment.dateFormat);
        this.getLatestData();
    }

    viewNewer() {
        if (moment.utc().diff(moment.utc(this.ended, environment.dateFormat), 'd') <= 7) {
            // time is within the last 7 days
            this.viewLatest();
        } else {
            // time is older than 7 days, so just add 7 to both started and ended
            this.viewingLatest = false;
            this.started = moment.utc(this.started, environment.dateFormat).add(7, 'd').format(environment.dateFormat);
            this.ended = moment.utc(this.ended, environment.dateFormat).add(7, 'd').format(environment.dateFormat);
            this.getLatestData();
        }
    }

    onFilterClick(e) {
        e.stopPropagation();
    }

    onStrikesChange(e) {
        if (!_.includes(this.selectedStrikes, e.itemValue)) {
            const idx = _.findIndex(this.data.datasets, d => {
                return d.id === e.itemValue;
            });
            if (idx >= 0) {
                this.data.datasets.splice(idx, 1);
                this.feedChart.chart.update();
            }
        } else {
            this.getLatestData();
        }
    }

    ngOnInit() {
        this.options = {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            'millisecond': 'DD MMM HHmm[Z]',
                            'second': 'DD MMM HHmm[Z]',
                            'minute': 'DD MMM HHmm[Z]',
                            'hour': 'DD MMM HHmm[Z]',
                            'day': 'DD MMM HHmm[Z]',
                            'week': 'DD MMM HHmm[Z]',
                            'month': 'DD MMM HHmm[Z]',
                            'quarter': 'DD MMM HHmm[Z]',
                            'year': 'DD MMM HHmm[Z]',
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: (label, index, labels) => {
                            return DataService.calculateFileSizeFromBytes(label, 0);
                        }
                    }
                }]
            },
            legend: {
                display: false
            },
            plugins: {
                datalabels: {
                    display: false
                }
            }
        };

        this.started = moment.utc().add(-7, 'd').startOf('d').format(environment.dateFormat);
        this.ended = moment.utc().format(environment.dateFormat);

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                if (params.strike_id) {
                    if (Array.isArray(params.strike_id)) {
                        this.selectedStrikes = [];
                        _.forEach(params.strike_id, id => {
                            this.selectedStrikes.push(+id);
                        });
                    } else {
                        this.selectedStrikes = [+params.strike_id];
                    }
                }
            }
            this.selectedTimeValue = params.use_ingest_time === 'true' ? 'ingest' : 'data';
        });

        this.getStrikes();
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
