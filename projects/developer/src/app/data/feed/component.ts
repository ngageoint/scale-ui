import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { IngestApiService } from '../ingest/api.service';
import { StrikesApiService } from '../../common/services/strikes/api.service';

@Component({
    selector: 'dev-feed',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class FeedComponent implements OnInit, OnDestroy {
    @ViewChild('feedChart') feedChart: any;
    subscription: any;
    dateFormat: string = environment.dateFormat;
    options: any;
    data = {
        datasets: [{
            data: []
        }]
    };
    strikes: any;
    started: any;
    ended: any;
    useIngestTime: boolean;
    strikeId: number;
    constructor(
        private ingestApiService: IngestApiService,
        private strikesApiService: StrikesApiService,
        private route: ActivatedRoute
    ) {}

    private getStrikes() {
        this.strikesApiService.getStrikes().subscribe(data => {
            this.strikes = data.results;
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
        const params = {
            page_size: 1000,
            started: this.started,
            ended: this.ended,
            use_ingest_time: this.useIngestTime
        };

        this.subscription = this.ingestApiService.getIngestStatus(params, true, 5000).subscribe(data => {
            // format data for streaming chart
            const returnArr = [];
            const allFeeds = _.orderBy(data.results, ['strike_name'], ['asc']);
            let selectedFeed: any = {};
            if (this.strikeId) {
                // set selectedFeed = new feed
                const feed = _.find(allFeeds, f => {
                    return f.strike.id === this.strikeId;
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
            // Array.prototype.push.apply(this.data.datasets[0].data, returnArr);
            this.feedChart.chart.update();
            // chart.update();
        }, err => {
            console.log(err);
        });
    }

    ngOnInit() {
        this.getStrikes();

        this.options = {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            'millisecond': 'DD MMM HH[Z]',
                            'second': 'DD MMM HH[Z]',
                            'minute': 'DD MMM HH[Z]',
                            'hour': 'DD MMM HH[Z]',
                            'day': 'DD MMM HH[Z]',
                            'week': 'DD MMM HH[Z]',
                            'month': 'DD MMM HH[Z]',
                            'quarter': 'DD MMM HH[Z]',
                            'year': 'DD MMM HH[Z]',
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

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.strikeId = params.strike_id || null;
            }
            this.started = params.started ?
                moment.utc(params.started).format(this.dateFormat) :
                moment.utc().add(-7, 'd').startOf('d').format(this.dateFormat);
            this.ended = params.ended ?
                moment.utc(params.ended).format(this.dateFormat) :
                moment.utc().format(this.dateFormat);
            this.useIngestTime = params.use_ingest_time || false;
            this.strikeId = +params.strike_id || null;
        });

        this.getLatestData();
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
