import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

import { Job } from './api.model';
import { JobsApiService } from './api.service';
import { DataService } from '../../data.service';

@Component({
    selector: 'app-job-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class JobDetailsComponent implements OnInit {
    job: Job;
    jobKeys: string[];
    options: any;
    data: any;
    constructor(
        private route: ActivatedRoute,
        private jobsApiService: JobsApiService,
        private dataService: DataService
    ) {}

    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.jobsApiService.getJob(id).then(data => {
                this.job = data as Job;
                this.jobKeys = Object.keys(this.job);
                this.options = {
                    scales: {
                        xAxes: [{
                            type: 'timeline',
                            time: {
                                min: moment.utc(data.created),
                                max: moment.utc(data.ended)
                            }
                        }]
                    },
                    responsive: true,
                    plugins: {
                        datalabels: false,
                        timeline: true
                    }
                };
                this.data = {
                    labels: ['Created', 'Queued', 'Executed'],
                    datasets: [{
                        data: [
                            [data.created, data.queued, this.dataService.calculateDuration(data.created, data.queued, true)]
                        ]
                    }, {
                        data: [
                            [data.queued, data.started, this.dataService.calculateDuration(data.queued, data.started, true)]
                        ]
                    }, {
                        data: [
                            [data.started, data.ended, this.dataService.calculateDuration(data.started, data.ended, true)]
                        ]
                    }]
                };
            });
        }
    }
}
