import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'dev-run-batch',
    templateUrl: './run-batch.component.html',
    styleUrls: ['./run-batch.component.scss']
})
export class RunBatchComponent implements OnInit {
    @Input() stepIndex: number;
    constructor() {}

    ngOnInit() {}
}
