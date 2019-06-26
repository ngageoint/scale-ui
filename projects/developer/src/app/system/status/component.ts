import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'dev-system-status',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class SystemStatusComponent implements OnInit {
    statuses = [
        {
            label: 'Scheduler',
            styleClass: 'system-status__healthy fa fa-check'
        }
    ];
    constructor() {
    }

    ngOnInit() {
    }
}
