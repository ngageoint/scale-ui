import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { IngestApiService } from '../ingest/api.service';
import { StrikesApiService } from '../../common/services/strikes/api.service';
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
    dateFormat: string = environment.dateFormat;
    options: any;
    data = {
        datasets: [{
            backgroundColor: '#cae3fd',
            borderColor: this.colorService.SCALE_BLUE3,
            borderWidth: 1,
            pointBackgroundColor: this.colorService.SCALE_BLUE3,
            pointRadius: 2,
            lineTension: 0,
            data: []
        }]
    };
    strikes: SelectItem[] = [];
    selectedStrike: number;
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
        private dataService: DataService,
        private colorService: ColorService,
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
            if (!this.selectedStrike) {
                this.selectedStrike = this.strikes[0].value;
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
            params['started'] = moment.utc(this.started, this.dateFormat).toISOString();
            params['ended'] = moment.utc(this.ended, this.dateFormat).toISOString();
        }

        this.chartLoading = true;
        this.subscription = this.ingestApiService.getIngestStatus(params, true, 5000).subscribe(data => {
            this.chartLoading = false;
            // format data for streaming chart
            const returnArr = [];
            const allFeeds = _.orderBy(data.results, ['strike_name'], ['asc']);
            let selectedFeed: any = {};
            if (this.selectedStrike) {
                // set selectedFeed = new feed
                const feed = _.find(allFeeds, f => {
                    return f.strike.id === this.selectedStrike;
                });
                selectedFeed = feed ? feed : null;
            } else {
                selectedFeed = allFeeds[0];
            }
            _.forEach(selectedFeed.values, v => {
                returnArr.push({
                    x: moment.utc(v.time).format(this.dateFormat),
                    y: v.size
                });
            });
            this.data.datasets[0].data = returnArr;
            this.feedChart.chart.update();

            const urlParams = {
                use_ingest_time: params.use_ingest_time,
                strike_id: this.selectedStrike
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
        this.started = moment.utc().subtract(7, 'd').startOf('d').format(this.dateFormat);
        this.ended = moment.utc().format(this.dateFormat);
        this.getLatestData();
    }

    viewOlder() {
        this.viewingLatest = false;
        this.started = moment.utc(this.started, this.dateFormat).subtract(7, 'd').format(this.dateFormat);
        this.ended = moment.utc(this.ended, this.dateFormat).subtract(7, 'd').format(this.dateFormat);
        this.getLatestData();
    }

    viewNewer() {
        if (moment.utc().diff(moment.utc(this.ended, this.dateFormat), 'd') <= 7) {
            // time is within the last 7 days
            this.viewLatest();
        } else {
            // time is older than 7 days, so just add 7 to both started and ended
            this.viewingLatest = false;
            this.started = moment.utc(this.started, this.dateFormat).add(7, 'd').format(this.dateFormat);
            this.ended = moment.utc(this.ended, this.dateFormat).add(7, 'd').format(this.dateFormat);
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
                            return this.dataService.calculateFileSizeFromBytes(label, 0);
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

        this.started = moment.utc().add(-7, 'd').startOf('d').format(this.dateFormat);
        this.ended = moment.utc().format(this.dateFormat);

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.selectedStrike = params.strike_id || null;
            }
            this.selectedTimeValue = params.use_ingest_time === 'true' ? 'ingest' : 'data';
            this.selectedStrike = +params.strike_id || null;
        });

        this.getStrikes();
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
