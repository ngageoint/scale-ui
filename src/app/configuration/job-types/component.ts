import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';

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
    selectedJobType: JobType;
    selectedJobTypeKeys: string[];
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private jobTypesDatatableService: JobTypesDatatableService,
        private jobTypesApiService: JobTypesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.isInitialized = false;
    }

    private updateData() {
        this.jobTypesApiService.getJobTypes(this.datatableOptions).then(data => {
            this.count = data.count;
            this.jobTypes = data.results as JobType[];
        });
    }
    private updateOptions() {
        this.jobTypesDatatableService.setJobTypesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/job-types'], {
            queryParams: this.datatableOptions
        });

        this.updateData();
    }
    private getJobTypeDetail(id: number) {
        this.jobTypesApiService.getJobType(id).then(data => {
            this.selectedJobType = data as JobType;
            this.selectedJobTypeKeys = Object.keys(this.selectedJobType);
        });
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
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onRowSelect(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            id: e.data.id
        });
        this.jobTypesDatatableService.setJobTypesDatatableOptions(this.datatableOptions);
        this.router.navigate(['/processing/job-types'], {
            queryParams: this.datatableOptions
        });
        this.getJobTypeDetail(e.data.id);
    }
    ngOnInit() {
        if (this.route.snapshot &&
            Object.keys(this.route.snapshot.queryParams).length > 0) {

            const params = this.route.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                id: params.id,
                started: params.started,
                ended: params.ended,
                name: params.name,
                category: params.category,
                is_active: params.is_active,
                is_operational: params.is_operational
            };
        } else {
            this.datatableOptions = this.jobTypesDatatableService.getJobTypesDatatableOptions();
        }
        this.updateOptions();
        if (this.datatableOptions.id) {
            this.getJobTypeDetail(this.datatableOptions.id);
        }
    }
}
