import { Component, OnInit } from '@angular/core';

import { DashboardService } from './dashboard.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    data: any;

    constructor(private dashboardService: DashboardService) {

        this.dashboardService.getJobLoad().then(data => {
            let results = data.results;
            let labels = [];
            let pending = [];
            let queue = [];
            let running = [];
            results.forEach(result => {
                labels.push(result['time']);
                pending.push(result['pending_count']);
                queue.push(result['queue_count']);
                running.push(result['running_count']);
            });
            this.data = {
                labels: labels,
                datasets: [{
                    label: 'Pending',
                    data: pending,
                    fill: false,
                    borderColor: '#058DC7'
                }, {
                    label: 'Queue',
                    data: queue,
                    fill: false,
                    borderColor: '#50B432'
                }, {
                    label: 'Running',
                    data: running,
                    fill: false,
                    borderColor: '#ED561B'
                }]
            };
        });
    }

    ngOnInit() {
    }

}
