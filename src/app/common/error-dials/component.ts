import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { ColorService } from '../../color.service';

@Component({
    selector: 'app-error-dials',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class ErrorDialsComponent implements OnInit {
    @Input() label: string;
    @Input() total: number;
    @Input() failed: number;
    @Input() data: any;
    @Input() legend = false;
    jobType: any;
    chartData: any;
    chartConfig: any;

    constructor(
        private colorService: ColorService
    ) {}

    ngOnInit() {
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
            cutoutPercentage: 75,
            rotation: 0.5 * Math.PI, // start from bottom
            legend: {
                display: this.legend,
                position: 'bottom'
            },
            elements: {
                arc: {
                    borderWidth: 0
                }
            }
        };
    }
}
