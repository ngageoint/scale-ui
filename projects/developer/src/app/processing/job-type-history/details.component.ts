import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import * as _ from 'lodash';

import { DataService } from '../../common/services/data.service';
import { ErrorsApiService } from '../../common/services/errors/api.service';

@Component({
    selector: 'dev-job-type-history-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class JobTypeHistoryDetailsComponent implements OnInit {
    datatableLoading: boolean;
    jobTypeName: string;
    errors: any;
    columns: any[];
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private dataService: DataService,
        private errorsApiService: ErrorsApiService
    ) {
        this.columns = [
            { field: 'title', header: 'Error' },
            { field: 'category', header: 'Category' },
            { field: 'created', header: 'Created' },
            { field: 'last_modified', header: 'Last Modified' }
        ];
        this.isInitialized = false;
    }

    private updateData() {
        this.datatableLoading = true;
        this.errorsApiService.getErrors({
            job_type_name: this.jobTypeName,
            sortOrder: -1,
            sortField: 'last_modified'
        }).subscribe(data => {
            _.forEach(data.results, result => {
                result.createdTooltip = this.dataService.formatDate(result.created);
                result.createdDisplay = this.dataService.formatDate(result.created, true);
                result.lastModifiedTooltip = this.dataService.formatDate(result.last_modified);
                result.lastModifiedDisplay = this.dataService.formatDate(result.last_modified, true);
            });
            this.errors = data.results;
            this.datatableLoading = false;
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type errors', detail: err.statusText});
            this.datatableLoading = false;
        });
    }

    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            this.updateData();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }

    ngOnInit() {
        if (this.route.snapshot) {
            this.jobTypeName = this.route.snapshot.paramMap.get('name');
            this.updateData();
        }
    }
}
