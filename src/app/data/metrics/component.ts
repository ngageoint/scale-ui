import { Component, OnInit } from '@angular/core';

import { MetricsApiService } from './api.service';

@Component({
    selector: 'app-metrics',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class MetricsComponent implements OnInit {

    constructor(
        private metricsApiService: MetricsApiService
    ) {
    }

    ngOnInit() {
    }
}
