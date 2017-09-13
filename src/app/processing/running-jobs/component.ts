import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';
import * as _ from 'lodash';
import * as moment from 'moment';

import { RunningJobsApiService } from './api.service';
import { RunningJobsDatatable } from './datatable.model';
import { RunningJobsDatatableService } from './datatable.service';
import { RunningJob } from './api.model';
import { DataService } from '../../data.service';
import { JobsDatatableService } from '../jobs/datatable.service';

@Component({
    selector: 'app-running-jobs',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RunningJobsComponent implements OnInit {
    datatableOptions: RunningJobsDatatable;
    runningJobs: RunningJob[];
    selectedJob: RunningJob;
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private runningJobsDatatableService: RunningJobsDatatableService,
        private runningJobsApiService: RunningJobsApiService,
        private dataService: DataService,
        private jobsDatatableService: JobsDatatableService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.isInitialized = false;
    }

    private updateData() {
        this.runningJobsApiService.getRunningJobs(this.datatableOptions).then(data => {
            this.count = data.count;
            _.forEach(data.results, (result) => {
                result.longest_running_duration = this.dataService.calculateDuration(result.longest_running, moment.utc().toISOString());
            });
            this.runningJobs = data.results as RunningJob[];
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        this.runningJobsDatatableService.setRunningJobsDatatableOptions(this.datatableOptions);

        this.router.navigate(['/processing/running-jobs'], {
            queryParams: this.datatableOptions,
            replaceUrl: true
        });

        this.updateData();
    }

    paginate(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: e.first,
            rows: parseInt(e.rows, 10)
        });
        this.updateOptions();
    }
    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            this.datatableOptions = Object.assign(this.datatableOptions, {
                first: 0
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onRowSelect(e) {
        console.log(e);
        const jobsDatatableOptions = this.jobsDatatableService.getJobsDatatableOptions();
        this.jobsDatatableService.setJobsDatatableOptions(Object.assign(jobsDatatableOptions, {
            first: 0,
            status: 'RUNNING',
            job_type_id: e.data.job_type.id
        }));
        this.router.navigate(['processing', 'jobs']);
    }
    ngOnInit() {
        if (this.route.snapshot &&
            Object.keys(this.route.snapshot.queryParams).length > 0) {

            const params = this.route.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10)
            };
        } else {
            this.datatableOptions = this.runningJobsDatatableService.getRunningJobsDatatableOptions();
        }
        this.updateOptions();
    }
}
