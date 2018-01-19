import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { ColorService } from '../../color.service';
import { JobsApiService } from '../../processing/jobs/api.service';
import { DashboardJobsService } from '../jobs.service';

@Component({
    selector: 'app-job-activity',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobActivityComponent implements OnInit, OnDestroy {
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
                    backgroundColor: this.colorService.getRgba(this.colorService.RUNNING, 0.7),
                    data: []
                }, {
                    label: 'Queued',
                    backgroundColor: this.colorService.getRgba(this.colorService.QUEUED, 0.7),
                    data: []
                }, {
                    label: 'Pending',
                    backgroundColor: this.colorService.getRgba(this.colorService.PENDING, 0.7),
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
                    type: 'time'
                }]
            },
            plugins: {
                datalabels: false
            }
        };
        this.updateData();
        this.favoritesSubscription = this.jobsService.favoritesUpdated.subscribe(() => {
            this.updateData();
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
        this.favoritesSubscription.unsubscribe();
    }
}
