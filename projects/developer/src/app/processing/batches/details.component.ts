import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import { BatchesApiService } from './api.service';

@Component({
    selector: 'dev-batch-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class BatchDetailsComponent implements OnInit {
    batchDetails: any = [];

    constructor(
        private route: ActivatedRoute,
        private batchesApiService: BatchesApiService
    ) {}

    ngOnInit() {
        if (this.route.snapshot) {
            const id = +this.route.snapshot.paramMap.get('id');
            this.batchesApiService.getBatch(id).subscribe(data => {
                this.batchDetails = data;
            });
        }
    }
}
