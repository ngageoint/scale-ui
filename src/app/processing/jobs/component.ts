import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
    statusValues: ['Running', 'Completed'];
    first: number;
    count: number;

    constructor(
        private jobsDatatableService: JobsDatatableService,
        private jobsApiService: JobsApiService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    private updateData() {
        this.jobsApiService.getJobs(this.datatableOptions).then(data => {
            this.count = data.count;
            this.jobs = data.results as Job[];
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

    onSort(e: { field: string, order: number }) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            rows: 10,
            sortField: e.field,
            sortOrder: e.order
        });
        this.updateOptions();
    }
    paginate(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: e.first,
            rows: parseInt(e.rows, 10)
        });
        this.updateOptions();
    }
    onFilter(e: { filters: object }) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            filters: e.filters
        });
        this.updateOptions();
    }
    ngOnInit() {
        const params = this.activatedRoute.snapshot.queryParams;
        if (Object.keys(params).length > 0) {
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                filters: params.filters,
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
