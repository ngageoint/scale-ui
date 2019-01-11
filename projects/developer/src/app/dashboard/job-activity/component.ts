import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { DashboardJobsService } from '../jobs.service';

@Component({
    selector: 'dev-job-activity',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobActivityComponent implements OnInit, OnDestroy {
    params: any;
    subscription: any;
    favorites = [];
    allJobs = [];
    constructor(
        private jobsService: DashboardJobsService
    ) {}

    private updateData() {
        this.favorites = this.jobsService.getFavorites();
        this.allJobs = this.jobsService.getAllJobs();
        this.params = {
            started: moment.utc().subtract(1, 'd').toISOString(),
            ended: moment.utc().toISOString(),
            job_type_id: this.favorites.length > 0 ? _.map(this.favorites, 'id') : _.map(this.allJobs, 'job_type.id')
        };
    }

    private unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onChartLoaded(data) {
        data.chart.canvas.parentNode.style.height = '360px';
    }

    ngOnInit() {
        this.updateData();
        this.subscription = this.jobsService.favoritesUpdated.subscribe(() => {
            this.updateData();
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
