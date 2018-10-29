import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';

import { IngestApiService } from './api.service';
import { Ingest } from './api.model';

@Component({
    selector: 'dev-ingest-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class IngestDetailsComponent implements OnInit, OnDestroy {
    loading: boolean;
    subscription: any;
    ingest: Ingest;
    ingestStatus: any;

    constructor(
        private route: ActivatedRoute,
        private ingestApiService: IngestApiService
    ) {}

    private getIngestDetail(id: number) {
        this.loading = true;
        this.subscription = this.ingestApiService.getIngest(id).subscribe(data => {
            this.loading = false;
            this.ingest = data;
            const now = moment.utc();
            const lastStatus = this.ingest.last_modified ? moment.utc(this.ingest.last_modified) : null;
            this.ingestStatus = lastStatus ?
                `${_.capitalize(this.ingest.status)} ${lastStatus.from(now)}` :
                _.capitalize(this.ingest.status);
        });
    }

    showStatus(statusPanel, $event) {
        statusPanel.show($event);
    }

    hideStatus(statusPanel) {
        statusPanel.hide();
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        if (this.route.snapshot) {
            const id = +this.route.snapshot.paramMap.get('id');
            this.getIngestDetail(id);
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.unsubscribe();
        }
    }
}
