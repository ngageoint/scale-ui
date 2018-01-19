import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { ColorService } from '../../color.service';
import { DashboardJobsService } from '../../dashboard/jobs.service';

@Component({
    selector: 'app-error-dials',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class ErrorDialsComponent implements OnInit, OnDestroy {
    @Input() label: string;
    @Input() total: number;
    @Input() failed: number;
    @Input() data: any;
    @Input() legend = false;
    subscription: any;
    jobType: any;
    chartData: any;
    chartConfig: any;

    constructor(
        private colorService: ColorService,
        private jobsService: DashboardJobsService
    ) {}

    private updateChart() {
        console.log(this.data);
        this.chartData = {
            labels: _.map(this.data, 'label'),
            datasets: [{
                data: _.map(this.data, 'value'),
                backgroundColor: [
                    this.colorService.ERROR_SYSTEM,   // system
                    this.colorService.ERROR_ALGORITHM,  // algorithm
                    this.colorService.ERROR_DATA  // data
                ],
                hoverBackgroundColor: []
            }]
        };

        this.chartConfig = {
            rotation: 0.5 * Math.PI, // start from bottom
            legend: {
                display: this.legend,
                position: 'bottom'
            },
            plugins: {
                datalabels: false
            },
            elements: {
                arc: {
                    borderWidth: 0
                }
            }
        };
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.updateChart();
        this.subscription = this.jobsService.favoritesUpdated.subscribe(() => {
            this.updateChart();
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }
}
