import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { DashboardApiService } from './api.service';
import { JobLoadChart } from './jobload.chart';


@Component({
    selector: 'app-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit {

    private jobloadChart: any;

    constructor(private dashboardApiService: DashboardApiService) {
        this.jobloadChart = {};
    }

    ngOnInit() {
        this.dashboardApiService.getJobLoad().then(data => {
            this.jobloadChart.data = JobLoadChart.convertApiData(data);
            this.jobloadChart.options = JobLoadChart.options;
        });
    }

}
