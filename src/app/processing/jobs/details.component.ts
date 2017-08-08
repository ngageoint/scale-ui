import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Job } from './api.model';
import { JobsApiService } from './api.service';

@Component({
    selector: 'app-job-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class JobDetailsComponent implements OnInit {
    job: Job;
    jobKeys: string[];
    constructor(
        private route: ActivatedRoute,
        private jobsApiService: JobsApiService
    ) { }

    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.jobsApiService.getJob(id).then(data => {
                this.job = data as Job;
                this.jobKeys = Object.keys(this.job);
            });
        }
    }
}
