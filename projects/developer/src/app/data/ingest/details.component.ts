import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Ingest } from './api.model';
import { Job } from '../../processing/jobs/api.model';
import { IngestApiService } from './api.service';
import { Globals } from '../../globals';

import { ThemeService } from '../../theme/theme.service';
import { UIChart } from 'primeng/chart';

@Component({
    selector: 'dev-ingest-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class IngestDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('chartDetails', {static: false}) chart: UIChart;
    themeSubscription: any;
    subscription: any;
    ingest: Ingest;
    jobs: Job[];
    loading: boolean;
    loadingExecutions: boolean;
    exeStatus: string;
    options: any;
    hasActiveJobExe: boolean;
    canRequeue: boolean;
    logDisplay: boolean;
    inputClass = 'p-col-12';
    outputClass = 'p-col-12';
    globals: Globals;

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private ingestApiService: IngestApiService,
        private themeService: ThemeService,
        globals: Globals
    ) {
        this.globals = globals;
    }

    private initIngestDetail(data) {
        this.ingest = data;
    }

    private getIngestDetail(id: number) {
        this.loading = true;
        this.subscription = this.ingestApiService.getIngest(id).subscribe(data => {
            this.loading = false;
            this.initIngestDetail(data);

            // get job executions
            this.loadingExecutions = true;
            this.hasActiveJobExe = false;
            this.ingestApiService.getIngestJobs(id)
                .subscribe(jobsData => {
                    this.loadingExecutions = false;
                    this.jobs = jobsData.results;
                    // Order the job-exes by created so index [0] will be the latest.
                    this.jobs.sort(function(a, b) {
                        return ('' + a.created).localeCompare(b.created);
                    });
                }, err => {
                    this.loadingExecutions = false;
                    this.messageService.add({severity: 'error', summary: 'Error retrieving job executions', detail: err.statusText});
                });
            }, err => {
                this.loading = false;
                this.messageService.add({severity: 'error', summary: 'Error retrieving job details', detail: err.statusText});
            });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.options = {
        };

        if (this.route.snapshot) {
            const id = +this.route.snapshot.paramMap.get('id');
            this.getIngestDetail(id);
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
        if (this.themeSubscription) {
            this.themeSubscription.unsubscribe();
        }
    }
}
