import { Component, OnInit, Injectable } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { JobService } from './jobs.service';
import { Job } from './job';

@Component({
    selector: 'app-jobs',
    templateUrl: './jobs.component.html',
    styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
    jobs: Job[];
    statusValues: ['Running', 'Completed'];
    gridOptions = {
        first: 0,
        rows: 10,
        sortField: 'last_modified',
        sortOrder: -1, // descending
        filters: {}
    };

    constructor(
        private jobService: JobService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {}

    private updateData() {
        this.jobService.getJobs(this.gridOptions.sortField, this.gridOptions.sortOrder).then(jobs => this.jobs = jobs);
    }
    onSort(e: { field: string, order: number }) {
        this.gridOptions.sortField = e.field;
        this.gridOptions.sortOrder = e.order;
        this.gridOptions.first = 0;
        this.router.navigate(['/processing/jobs'], {
            queryParams: {
                sortField: this.gridOptions.sortField, sortOrder: this.gridOptions.sortOrder
            }
        });
        // console.log(this.gridOptions);
        // this.localStorageService.set('my-grid-options', this.gridOptions);
    }
    onPage(e: { first: number, rows: number }) {
        this.gridOptions.rows = e.rows;
        this.gridOptions.first = e.first;
        this.router.navigate(['/processing/jobs'], {
            queryParams: {
                page: this.gridOptions.rows
            }
        });
        // console.log(this.gridOptions);
        // this.localStorageService.set('my-grid-options', this.gridOptions);
    }
    onFilter(e: { filters: object }) {
        this.gridOptions.filters = e.filters;
        this.updateData();
        // console.log(this.gridOptions);
    }
    ngOnInit() {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.gridOptions.first = params.first || null;
            this.gridOptions.rows = params.rows || null;
            this.gridOptions.sortField = params.sortField || null;
            this.gridOptions.sortOrder = params.sortOrder || null;
            this.gridOptions.filters = params.filters || null;
            console.log(this.gridOptions);
        });
        this.updateData();
    }

}
