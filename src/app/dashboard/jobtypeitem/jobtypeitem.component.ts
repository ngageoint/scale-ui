import { Component, Input, OnInit } from '@angular/core';


@Component({
    selector: 'app-jobtypeitem',
    templateUrl: './jobtypeitem.component.html',
    styleUrls: ['./jobtypeitem.component.scss']
})
export class JobtypeitemComponent implements OnInit {

    @Input() item: any;
    constructor() {
        this.item = {};
    }

    ngOnInit() {
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    getRunningCount() {
        const counts = this.item.job_counts;
        if (!counts || counts.length < 1) {
            return 0;
        }
        for (let i = 0; i < counts.length; i++) {
            if (counts[i].status === 'RUNNING') {
                return counts[i].count;
            }
        }
        return 0;
    }
}
