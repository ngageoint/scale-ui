import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'dev-system-status',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class SystemStatusComponent implements OnInit {
    services = [
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
