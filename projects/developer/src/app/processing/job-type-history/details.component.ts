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

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private errorsApiService: ErrorsApiService
    ) {}

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
