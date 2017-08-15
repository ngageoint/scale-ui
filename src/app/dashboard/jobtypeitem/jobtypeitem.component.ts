import { Component, Input, OnInit } from '@angular/core';


@Component({
    selector: 'app-jobtypeitem',
    templateUrl: './jobtypeitem.component.html',
    styleUrls: ['./jobtypeitem.component.scss']
})
export class JobtypeitemComponent implements OnInit {

    @Input() jobType: any;
    constructor() {
        this.jobType = {};
    }

    ngOnInit() {
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
}
