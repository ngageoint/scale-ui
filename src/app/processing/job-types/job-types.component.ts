import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { JobTypeService } from './job-type.service';
import { JobType } from './job-type.model';
import { JobTypesDatatableOptions } from './job-types-datatable-options.model';
import { DatatableService } from '../../services/datatable.service';

@Component({
    selector: 'app-job-types',
    templateUrl: './job-types.component.html',
    styleUrls: ['./job-types.component.scss']
})
export class JobTypesComponent implements OnInit {
    datatableOptions: JobTypesDatatableOptions;
    jobTypes: JobType[];

    constructor(
        private datatableService: DatatableService,
        private jobTypeService: JobTypeService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    private updateData() {
        this.jobTypeService.getJobTypes(this.datatableOptions).then(data => this.jobTypes = data.results as JobType[]);
    }
    private updateOptions() {
        this.datatableService.setJobTypesDatatableOptions(this.datatableOptions);

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
        this.datatableOptions = this.datatableService.getJobTypesDatatableOptions();
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
