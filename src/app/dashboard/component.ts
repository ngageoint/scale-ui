import { Component, OnInit } from '@angular/core';

import { DashboardApiService } from './api.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit {

    data: any;

    constructor(private dashboardApiService: DashboardApiService) {

        this.dashboardApiService.getJobLoad().then(data => {
            const results = data.results;
            const labels = [];
            const pending = [];
            const queue = [];
            const running = [];
            results.forEach(result => {
                labels.push(result['time']);
                pending.push(result['pending_count']);
                queue.push(result['queue_count']);
                running.push(result['running_count']);
            });
            this.data = {
                labels: labels,
                datasets: [{
                    label: 'Running',
                    data: running,
                    fill: false,
                    borderColor: '#ADB229'
                }, {
                    label: 'Pending',
                    data: pending,
                    fill: false,
                    borderColor: '#48ACFF'
                }, {
                    label: 'Queue',
                    data: queue,
                    fill: false,
                    borderColor: '#FF6761'
                }]
            };
        });
    }

    ngOnInit() {
    }

}
