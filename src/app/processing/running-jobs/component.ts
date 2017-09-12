import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';
import * as _ from 'lodash';

import { JobsApiService } from '../jobs/api.service';
import { Job } from '../jobs/api.model';
import { JobsDatatable } from '../jobs/datatable.model';
import { RunningJobsDatatableService } from './datatable.service';

@Component({
    selector: 'app-running-jobs',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class RunningJobsComponent implements OnInit {
    datatableOptions: JobsDatatable;
    jobs: Job[];
    selectedJob: Job;
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private runningJobsDatatableService: RunningJobsDatatableService,
        private jobsApiService: JobsApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.isInitialized = false;
    }

    private updateData() {
        this.jobsApiService.getJobs(this.datatableOptions).then(data => {
            this.count = data.count;
            this.jobs = data.results as Job[];
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        this.runningJobsDatatableService.setRunningJobsDatatableOptions(this.datatableOptions);

        this.router.navigate(['/processing/running-jobs'], {
            queryParams: this.datatableOptions
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
        this.router.navigate(['/processing/jobs/' + e.data.id]);
    }
    ngOnInit() {
        if (this.route.snapshot &&
            Object.keys(this.route.snapshot.queryParams).length > 0) {

            const params = this.route.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: 'last_modified',
                sortOrder: -1,
                started: null,
                ended: null,
                status: 'RUNNING',
                job_id: null,
                job_type_id: null,
                job_type_name: null,
                job_type_category: null,
                batch_id: null,
                error_category: null,
                include_superseded: null
            };
        } else {
            this.datatableOptions = this.runningJobsDatatableService.getRunningJobsDatatableOptions();
        }
        this.updateOptions();
    }
}
