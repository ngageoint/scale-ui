import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ErrorsApiService } from '../../common/services/errors/api.service';

@Component({
    selector: 'dev-job-type-history-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class JobTypeHistoryDetailsComponent implements OnInit {
    datatableLoading: boolean;
    errors: any;
    columns: any[];
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private errorsApiService: ErrorsApiService
    ) {
        this.columns = [
            { field: '', header: 'Job Type' },
            { field: 'job_type.version', header: 'Version' },
            { field: 'highest_priority', header: 'Highest Priority' },
            { field: 'count', header: 'Count' },
            { field: 'longest_queued_duration', header: 'Duration of Longest Queued Job' }
        ];
        this.isInitialized = false;
    }

    private updateData() {
        this.datatableLoading = true;
    }

    private getErrors(name: string) {
        this.errorsApiService.getErrors({ job_type_name: name }).subscribe(data => {
            this.errors = data.results;
            this.updateData();
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type errors', detail: err.statusText});
        });
    }

    ngOnInit() {
        if (this.route.snapshot) {
            const name = this.route.snapshot.paramMap.get('name');
            this.getErrors(name);
        }
    }
}
