import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { JobService } from './jobs.service';
import { Job } from './job.model';
import { JobsDatatableOptions } from './jobs-datatable-options.model';
import { UPDATE_DATATABLE } from './jobs-datatable.actions';

interface DatatableState {
    jobsDatatableOptions: JobsDatatableOptions
}

@Component({
    selector: 'app-jobs',
    templateUrl: './jobs.component.html',
    styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
    datatableOptionsState: Observable<JobsDatatableOptions>;
    datatableOptions: JobsDatatableOptions;
    jobs: Job[];
    statusValues: ['Running', 'Completed'];

    constructor(
        private jobService: JobService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private store: Store<DatatableState>
    ) {
        this.datatableOptionsState = store.select<JobsDatatableOptions>(s => s.jobsDatatableOptions);
    }

    private updateData() {
        // console.log(this.datatableOptions);
        this.jobService.getJobs(this.datatableOptions).then(jobs => this.jobs = jobs);
    }
    onSort(e: { field: string, order: number }) {
        this.router.navigate(['/processing/jobs'], {
            queryParams: {
                sortField: e.field,
                sortOrder: e.order,
                first: 0
            }
        });
    }
    onPage(e: { first: number, rows: number }) {
        this.router.navigate(['/processing/jobs'], {
            queryParams: {
                page: e.first
            }
        });
    }
    onFilter(e: { filters: object }) {
        this.router.navigate(['/processing/jobs'], {
            queryParams: {
                filters: e.filters
            }
        });
    }
    ngOnInit() {
        this.datatableOptionsState.subscribe((state) => {
            this.datatableOptions = state;
        });
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.store.dispatch({
                type: UPDATE_DATATABLE,
                payload: params
            });
            this.updateData();
        });
        // this.updateData();
    }

}
