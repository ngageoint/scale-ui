import { Component, OnInit, Injectable } from '@angular/core';

import { DataTableModule, SharedModule } from 'primeng/primeng';

import { JobService } from './jobs.service';
import { Job } from './job';

@Component({
    selector: 'app-jobs',
    templateUrl: './jobs.component.html',
    styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
    jobs: Job[];

    constructor(private jobService: JobService) {}

    ngOnInit() {
        this.jobService.getJobs().then(jobs => this.jobs = jobs);
    }

}
