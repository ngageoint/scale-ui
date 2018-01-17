import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { JobsApiService } from '../../processing/jobs/api.service';
import { JobsDatatable } from '../../processing/jobs/datatable.model';
import { Job } from '../../processing/jobs/api.model';
import { DashboardJobsService } from '../jobs.service';

@Component({
    selector: 'app-job-activity',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobActivityComponent implements OnInit, OnDestroy {
    params: JobsDatatable;
    count: number;
    runningJobs: any;
    subscription: any;
    favoritesSubscription: any;
    favorites = [];
    activeJobs = [];

    constructor(
        private jobsApiService: JobsApiService,
        private jobsService: DashboardJobsService
    ) {}

    private updateData() {
        this.unsubscribe();
        this.favorites = this.jobsService.getFavorites();
        this.activeJobs = this.jobsService.getActiveJobs();
        this.params = {
            first: 0,
            rows: 1000,
            sortField: 'last_modified',
            sortOrder: -1,
            started: moment.utc().subtract(1, 'd').startOf('h').toISOString(),
            ended: moment.utc().startOf('h').toISOString(),
            status: 'RUNNING',
            job_id: null,
            job_type_id: this.favorites.length > 0 ? _.map(this.favorites, 'id') : _.map(this.activeJobs, 'job_type.id'),
            job_type_name: null,
            job_type_category: null,
            batch_id: null,
            error_category: null,
            include_superseded: null
        };
        this.subscription = this.jobsApiService.getJobs(_.pickBy(this.params), true).subscribe(data => {
            this.count = data.count;
            this.runningJobs = Job.transformer(data.results);
        });
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
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
