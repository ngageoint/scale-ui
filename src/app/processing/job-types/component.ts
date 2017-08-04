import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { JobTypesApiService } from './api.service';
import { JobType } from './api.model';
import { JobTypesDatatable } from './datatable.model';
import { JobTypesDatatableService } from './datatable.service';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobTypesComponent implements OnInit {
    datatableOptions: JobTypesDatatable;
    jobTypes: JobType[];

    constructor(
        private jobTypesDatatableService: JobTypesDatatableService,
        private jobTypesApiService: JobTypesApiService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    private updateData() {
        this.jobTypesApiService.getJobTypes(this.datatableOptions).then(data => this.jobTypes = data.results as JobType[]);
    }
    private updateOptions() {
        this.jobTypesDatatableService.setJobTypesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/job-types'], {
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
        // this.datatableOptions = Object.assign(this.datatableOptions, {
        //     filters: e.filters
        // });
        // this.updateOptions();
    }

    ngOnInit() {
        this.datatableOptions = this.jobTypesDatatableService.getJobTypesDatatableOptions();

        if (this.activatedRoute.snapshot &&
            Object.keys(this.activatedRoute.snapshot.queryParams).length > 0) {

            const params = this.activatedRoute.snapshot.queryParams;
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
