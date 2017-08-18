import { Component, Input, OnInit } from '@angular/core';


@Component({
    selector: 'app-jobtypeitem',
    templateUrl: './jobtypeitem.component.html',
    styleUrls: ['./jobtypeitem.component.scss']
})
export class JobtypeitemComponent implements OnInit {

    @Input() item: any;
    constructor() {
        this.item = {
            job_type: {
                icon_code: ''
            },
            job_counts: []
        };
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

    getStatusClass() {
        const counts = this.item.job_counts;
        if (!counts || !counts.length || counts.length < 1) {
            return 'jti__status-unknown';
        }

        let failed = 0;
        let completed = 0;
        for (let i = 0; i < counts.length; i++) {
            if (counts[i].status === 'COMPLETED') {
                completed += counts[i].count;
            }
            if (counts[i].status === 'FAILED') {
                failed += counts[i].count;
            }
        }

        const total = failed + completed;
        let successRate = 100;

        if (failed > 0) {
            successRate = 100 - ((failed / total) * 100);
        }

        let cssClass = 'jti__status-good';
        if (successRate <= 80) {
            cssClass = 'jti__status-warn';
        }
        if (successRate <= 60) {
            cssClass = 'jti__status-error';
        }

        return cssClass;
    }
}
