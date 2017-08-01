import { Component, OnInit } from '@angular/core';

import { JobTypeService } from './job-type.service';
import { JobType } from './job-type.model';

@Component({
    selector: 'app-job-types',
    templateUrl: './job-types.component.html',
    styleUrls: ['./job-types.component.scss']
})
export class JobTypesComponent implements OnInit {
    jobTypes: JobType[];

    constructor(
        private jobTypeService: JobTypeService
    ) { }

    ngOnInit() {
        this.jobTypeService.getJobTypes().then(jobTypes => this.jobTypes = jobTypes);
    }
}
