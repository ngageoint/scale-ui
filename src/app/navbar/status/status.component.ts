import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

    private pctCpu = 70;
    private pctMem = 40;
    private pctDisk = 95;

    constructor() { }

    ngOnInit() {
    }

}
