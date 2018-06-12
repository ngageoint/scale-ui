import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'dev-loading-indicator',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class LoadingIndicatorComponent implements OnInit {
    @Input() loading: boolean;

    constructor() {}

    ngOnInit() {
    }
}
