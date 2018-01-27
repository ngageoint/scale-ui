import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { ColorService } from '../../color.service';
import { JobsApiService } from '../../processing/jobs/api.service';
import { DashboardJobsService } from '../jobs.service';
import { UIChart } from 'primeng/primeng';

@Component({
    selector: 'app-job-activity',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobActivityComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chart') chart: UIChart;
    params: any;
    subscription: any;
    favoritesSubscription: any;
    favorites = [];
    activeJobs = [];
    data: any;
    options: any;

    constructor(
        private colorService: ColorService,
        private jobsApiService: JobsApiService,
        private jobsService: DashboardJobsService
    ) {}

    private updateData() {
        this.unsubscribe();
        this.favorites = this.jobsService.getFavorites();
        this.activeJobs = this.jobsService.getActiveJobs();
        this.params = {
            started: moment.utc().subtract(1, 'd').toISOString(),
            ended: moment.utc().toISOString(),
            job_type_id: this.favorites.length > 0 ? _.map(this.favorites, 'id') : _.map(this.activeJobs, 'job_type.id')
        };
        this.subscription = this.jobsApiService.getJobLoad(this.params, true).subscribe(data => {
            this.data = {
                datasets: [{
                    label: 'Running',
                    backgroundColor: this.colorService.SCALE_BLUE3,
                    data: []
                }, {
                    label: 'Queued',
                    backgroundColor: this.colorService.SCALE_BLUE2,
                    data: []
                }, {
                    label: 'Pending',
                    backgroundColor: this.colorService.SCALE_BLUE1,
                    data: []
                }]
            };
            _.forEach(this.data.datasets, dataset => {
                _.forEach(data.results, result => {
                    dataset.data.push({
                        x: moment.utc(result.time).toDate(),
                        y: dataset.label === 'Pending' ?
                            result.pending_count :
                            dataset.label === 'Queued' ?
                                result.queued_count :
                                result.running_count
                    });
                });
            });
        });
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.options = {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            hour: 'DD MMM HHmm[Z]'
                        }
                    }
                }],
                yAxes: [{
                    stacked: true
                }]
            },
            plugins: {
                datalabels: false
            },
            maintainAspectRatio: false
        };
        this.updateData();
        this.favoritesSubscription = this.jobsService.favoritesUpdated.subscribe(() => {
            this.updateData();
        });
    }

    ngAfterViewInit() {
        if (this.chart.chart) {
            this.chart.chart.canvas.parentNode.style.height = '33vh';
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
        this.favoritesSubscription.unsubscribe();
    }
}
