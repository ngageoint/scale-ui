import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { JobService } from './job.service';
import { Job } from './job.model';
import { JobsDatatableOptions } from './jobs-datatable-options.model';
import { DatatableService } from '../../services/datatable.service';

@Component({
    selector: 'app-jobs',
    templateUrl: './jobs.component.html',
    styleUrls: ['./jobs.component.scss']
})

export class JobsComponent implements OnInit {
    datatableOptions: JobsDatatableOptions;
    jobs: Job[];
    statusValues: ['Running', 'Completed'];

    constructor(
        private datatableService: DatatableService,
        private jobService: JobService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    private updateData() {
        this.jobService.getJobs(this.datatableOptions).then(jobs => this.jobs = jobs);
    }
    private updateOptions() {
        this.datatableService.setJobsDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/jobs'], {
            queryParams: this.datatableOptions
        });

        this.updateData();
    }

    onSort(e: { field: string, order: number }) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            sortField: e.field,
            sortOrder: e.order,
            first: 0
        });
        this.updateOptions();
    }
    onPage(e: { first: number, rows: number }) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            page: e.first
        });
        this.updateOptions();
    }
    onFilter(e: { filters: object }) {
        console.log(e.filters);
        this.datatableOptions = Object.assign(this.datatableOptions, {
            filters: e.filters
        });
        this.updateOptions();
    }
    ngOnInit() {
        this.datatableOptions = this.datatableService.getJobsDatatableOptions();
        const params = this.activatedRoute.snapshot.queryParams;
        if (Object.keys(params).length > 0) {
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                filters: params.filters
            };
        }
        this.updateOptions();
    }
}
