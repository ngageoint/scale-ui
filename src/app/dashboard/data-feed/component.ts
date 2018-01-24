import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import { IngestApiService } from '../../data/ingest/api.service';

@Component({
    selector: 'app-data-feed',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DataFeedComponent implements OnInit {
    params: any;
    data: any;
    constructor(
        private ingestApiService: IngestApiService
    ) {
    }

    ngOnInit() {
        this.params = {
            started: moment.utc().subtract(24, 'h').toISOString(),
            ended: moment.utc().toISOString()
        };
        this.ingestApiService.getIngestStatus(this.params).then(data => {
            this.data = data;
            console.log(data);
        });
    }
}
