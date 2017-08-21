import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { DashboardApiService } from './api.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit {

    private allJobTypes: any[];
    private favoriteJobTypes: any[];

    constructor(
        private dashboardApiService: DashboardApiService
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
            // this.allJobTypes.forEach(jt => {
            //     console.log(JSON.stringify(jt));
            // });
        });
    }
}
