import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-errordials',
    templateUrl: './errordials.component.html',
    styleUrls: ['./errordials.component.scss']
})
export class ErrordialsComponent implements OnInit {

    private jobType: any;
    private data: any;
    private chartConfig: any;
    private totalJobs: number;
    private failedJobs: number;

    constructor() {
        // this should be passed in
        this.jobType = {
            'job_type': {
                'id': 2, 'name': 'sam', 'version': '1.0', 'title': 'Spectral Angle Mapper',
                'description': 'The algorithm determines the...',
                'category': 'spectral', 'author_name': null, 'author_url': null,
                'is_system': true, 'is_long_running': false, 'is_active': true,
                'is_operational': true, 'is_paused': false, 'icon_code': 'f0e7'
            },
            'job_counts': [{
                'status': 'RUNNING',
                'count': 75,
                'most_recent': '2015-08-31T22:09:12.674Z',
                'category': null
            }, {
                'status': 'FAILED',
                'count': 45,
                'most_recent': '2015-08-31T22:09:12.674Z',
                'category': 'SYSTEM'
            }, {
                'status': 'FAILED',
                'count': 56,
                'most_recent': '2015-08-31T22:09:12.674Z',
                'category': 'DATA'
            }, {
                'status': 'FAILED',
                'count': 2,
                'most_recent': '2015-08-31T22:09:12.674Z',
                'category': 'ALGORITHM'
            }, {
                'status': 'COMPLETED',
                'count': 75,
                'most_recent': '2015-08-31T21:51:12.674Z',
                'category': null
            }]
        };
    }

    ngOnInit() {

        const portions = {};
        let failures = 0;
        let total = 0;
        for (let i = 0; i < this.jobType.job_counts.length; i++) {
            const count = this.jobType.job_counts[i];
            if (count.status === 'RUNNING') {
                continue; // skip it
            } else if (count.status === 'COMPLETED') {
                portions['COMPLETED'] = count.count;
                total += count.count;
            } else if (count.status === 'FAILED') {
                portions[count.category] = count.count;
                total += count.count;
                failures += count.count;
            }
        }

        const labels = ['COMPLETED', 'SYSTEM', 'DATA', 'ALGORITHM'];
        const values = [];
        for (let i = 0; i < labels.length; i++) {
            values.push(portions[labels[i]]);
        }

        this.totalJobs = total;
        this.failedJobs = failures;
        this.data = {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#354131',  // completed
                    '#934638',  // data
                    '#935D38',  // algorithm
                    '#937438'   // system
                ],
                hoverBackgroundColor: []
            }]
        };

        this.chartConfig = {
            cutoutPercentage: 75,
            rotation: 0.5 * Math.PI, // start from bottom
            legend: {
                display: false,
                position: 'bottom'
            }
        };
    }
}
