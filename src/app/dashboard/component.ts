import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { DashboardApiService } from './api.service';
import { DashboardDatatableService } from './datatable.service';
import { JobType } from './api.model';


@Component({
    selector: 'app-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit {

    private jobTypes: JobType[];
    private count: number;

    constructor(
        private dashboardApiService: DashboardApiService,
        private dashboardDatatableService: DashboardDatatableService
    ) {

    }

    ngOnInit() {
        this.updateData();
    }

    private updateData() {
        this.dashboardApiService.getJobTypes().then(data => {
            this.count = data.count;
            this.jobTypes = data.results as JobType[];
        });
    }
}
