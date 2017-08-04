import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';
import * as _ from 'lodash';

import { JobsApiService } from './api.service';
import { Job } from './api.model';
import { JobsDatatable } from './datatable.model';
import { JobsDatatableService } from './datatable.service';

@Component({
    selector: 'app-jobs',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobsComponent implements OnInit {
    datatableOptions: JobsDatatable;
    jobs: Job[];
    jobTypeNames: string[];
    statusValues: ['Running', 'Completed'];
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private jobsDatatableService: JobsDatatableService,
        private jobsApiService: JobsApiService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.isInitialized = false;
    }

    private updateData() {
        this.jobsApiService.getJobs(this.datatableOptions).then(data => {
            this.count = data.count;
            this.jobs = data.results as Job[];
            this.jobTypeNames = _.map(this.jobs, 'job_type.name');
            console.log(this.jobTypeNames);
        });
    }
    private updateOptions() {
        this.jobsDatatableService.setJobsDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/jobs'], {
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
                first: 0,
                sortField: e.sortField,
                sortOrder: e.sortOrder
                // job_type_name: e.filters['job_type.name']['value']
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    ngOnInit() {
        if (this.activatedRoute.snapshot &&
            Object.keys(this.activatedRoute.snapshot.queryParams).length > 0) {

            const params = this.activatedRoute.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                started: params.started,
                ended: params.ended,
                status: params.status,
                job_id: params.job_id,
                job_type_id: params.job_type_id,
                job_type_name: params.job_type_name,
                job_type_category: params.job_type_category,
                batch_id: params.batch_id,
                error_category: params.error_category,
                include_superseded: params.include_superseded
            };
        } else {
            this.datatableOptions = this.jobsDatatableService.getJobsDatatableOptions();
        }
        this.updateOptions();
    }
}
