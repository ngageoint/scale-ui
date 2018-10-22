import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IngestApiService } from './api.service';

@Component({
    selector: 'dev-ingest-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class IngestDetailsComponent implements OnInit, OnDestroy {
    loading: boolean;
    subscription: any;
    ingest: any;

    constructor(
        private route: ActivatedRoute,
        private ingestApiService: IngestApiService
    ) {}

    private getIngestDetail(id: number) {
        this.loading = true;
        this.subscription = this.ingestApiService.getIngest(id).subscribe(data => {
            this.loading = false;
            console.log(data);
        });
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
