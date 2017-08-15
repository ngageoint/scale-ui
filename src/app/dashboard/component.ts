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

    private allJobTypes: JobType[];
    private favoriteJobTypes: JobType[];

    constructor(
        private dashboardApiService: DashboardApiService,
        private dashboardDatatableService: DashboardDatatableService
    ) {
    }

    ngOnInit() {
        this.refreshAllJobTypes();
    }

    private refreshAllJobTypes() {
        this.dashboardApiService.getJobTypes().then(data => {
            this.allJobTypes = data.results as JobType[];
            console.log(`Job: ${JSON.stringify(data.results[0])}`);
        });
    }
}
