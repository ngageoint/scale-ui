import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { JobType } from '../../configuration/job-types/api.model';

@Component({
    selector: 'dev-job-type-history-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class JobTypeHistoryDetailsComponent implements OnInit {
    jobType: JobType;

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private jobTypesApiService: JobTypesApiService
    ) {}

    private getJobType(name: string, version: string) {
        this.jobTypesApiService.getJobType(name, version).subscribe(data => {
            this.jobType = data;
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type details', detail: err.statusText, life: 10000});
        });
    }

    ngOnInit() {
        if (this.route.snapshot) {
            const name = this.route.snapshot.paramMap.get('name');
            const version = this.route.snapshot.paramMap.get('version');
            this.getJobType(name, version);
        }
    }
}
