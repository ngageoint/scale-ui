import { Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { JobTypesApiService } from '../configuration/job-types/api.service';
import { DashboardJobsService } from './jobs.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    subscription: any;
    activeJobTypes: any[];
    favoriteJobTypes: any[];
    total: number;
    failed: number;
    chartData: any;
    totalActive: number;
    failedActive: number;
    chartDataActive: any;
    chartTitle: string;

    constructor(
        private jobTypesApiService: JobTypesApiService,
        private jobsService: DashboardJobsService
    ) {
        this.activeJobTypes = [];
        this.favoriteJobTypes = [];
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    ngOnInit() {
        this.refreshAllJobTypes();
        this.jobsService.favoritesUpdated.subscribe(() => {
            this.refreshAllJobTypes();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }

    private generateStats(jobData: any[]): any {
        const allJobCounts = _.flatten(_.map(jobData, 'job_counts'));
        const sysErrors = _.sum(_.map(_.filter(allJobCounts, (jobCount) => {
            return jobCount.status === 'FAILED' && jobCount.category === 'SYSTEM';
        }), 'count'));
        const algErrors = _.sum(_.map(_.filter(allJobCounts, (jobCount) => {
            return jobCount.status === 'FAILED' && jobCount.category === 'ALGORITHM';
        }), 'count'));
        const dataErrors = _.sum(_.map(_.filter(allJobCounts, (jobCount) => {
            return jobCount.status === 'FAILED' && jobCount.category === 'DATA';
        }), 'count'));
        const total = _.sum(_.map(_.filter(allJobCounts, (jobCount) => {
            return jobCount.status !== 'RUNNING';
        }), 'count'));
        const failed = sysErrors + algErrors + dataErrors;
        const chartData = [
            {
                label: 'SYSTEM',
                value: sysErrors
            },
            {
                label: 'ALGORITHM',
                value: algErrors
            },
            {
                label: 'DATA',
                value: dataErrors
            }
        ];
        return {
            total: total,
            failed: failed,
            chartData: chartData
        };
    }

    private refreshAllJobTypes() {
        this.unsubscribe();
        this.subscription = this.jobTypesApiService.getJobTypeStatus(true).subscribe(data => {
            this.activeJobTypes = _.filter(data.results, (result) => {
                const jobCounts = _.filter(result.job_counts, (count) => {
                    return count.status !== 'COMPLETED';
                });
                return jobCounts.length > 0;
            });
            this.jobsService.setActiveJobs(this.activeJobTypes);

            const totalJobStats = this.generateStats(data.results);
            this.total = totalJobStats.total;
            this.failed = totalJobStats.failed;
            this.chartData = totalJobStats.chartData;

            const activeJobStats = this.generateStats(this.activeJobTypes);
            this.totalActive = activeJobStats.total;
            this.failedActive = activeJobStats.failed;
            this.chartDataActive = activeJobStats.chartData;

            const favs = [];
            this.activeJobTypes.forEach(jt => {
                if (this.jobsService.isFavorite(jt.job_type)) {
                    favs.push(jt);
                }
            });
            this.favoriteJobTypes = favs;
            this.chartTitle = 'Completed vs. Failed counts for';
            this.chartTitle = favs.length > 0 ? `${this.chartTitle} Favorites` : `${this.chartTitle} Active Jobs`;
        });
    }
}
