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

    private allJobTypes: any[];
    private favoriteJobTypes: any[];

    constructor(
        private dashboardApiService: DashboardApiService,
        private dashboardDatatableService: DashboardDatatableService
    ) {
        this.allJobTypes = [];
        this.favoriteJobTypes = [];
    }

    ngOnInit() {
        this.refreshAllJobTypes();
    }

    private refreshAllJobTypes() {
        this.dashboardApiService.getJobTypesAndStatus().then(data => {
            this.allJobTypes = data.results as any[];
        });
    }
}
