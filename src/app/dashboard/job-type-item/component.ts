import { Component, Input, OnInit } from '@angular/core';

import { DashboardJobsService } from '../jobs.service';

@Component({
    selector: 'app-job-type-item',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobTypeItemComponent implements OnInit {

    @Input() item: any;
    constructor(private jobsService: DashboardJobsService) {
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

    getFavoriteBtnClass() {
        if (this.jobsService.isFavorite(this.item.job_type)) {
            return 'fa fa-star';
        }
        return 'fa fa-star-o';
    }

    toggleFavorite($event) {
        this.jobsService.toggleFavorite(this.item.job_type);
    }
}
