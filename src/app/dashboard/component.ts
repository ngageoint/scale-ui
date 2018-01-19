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
    errorDialTotalAll: number;
    errorDialFailedAll: number;
    errorDialDataAll: any;
    errorDialTotalActive: number;
    errorDialFailedActive: number;
    errorDialDataActive: any;
    errorDialTotalFavs: number;
    errorDialFailedFavs: number;
    errorDialDataFavs: any;
    perfChartTitle: string;
    activityChartTitle: string;

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

            const favs = [];
            this.activeJobTypes.forEach(jt => {
                if (this.jobsService.isFavorite(jt.job_type)) {
                    favs.push(jt);
                }
            });
            this.favoriteJobTypes = favs;

            const totalJobStats = this.generateStats(data.results);
            this.errorDialTotalAll = totalJobStats.total;
            this.errorDialFailedAll = totalJobStats.failed;
            this.errorDialDataAll = totalJobStats.chartData;

            const activeJobStats = this.generateStats(this.activeJobTypes);
            this.errorDialTotalActive = activeJobStats.total;
            this.errorDialFailedActive = activeJobStats.failed;
            this.errorDialDataActive = activeJobStats.chartData;

            const favoriteJobStats = this.generateStats(this.favoriteJobTypes);
            debugger;
            this.errorDialTotalFavs = favoriteJobStats.total;
            this.errorDialFailedFavs = favoriteJobStats.failed;
            this.errorDialDataFavs = favoriteJobStats.chartData;

            this.perfChartTitle = 'Completed vs. Failed counts';
            this.perfChartTitle = favs.length > 0 ?
                `${this.perfChartTitle} (Favorites)` :
                `${this.perfChartTitle} (Active Jobs)`;
            this.activityChartTitle = 'Job Activity';
            this.activityChartTitle = favs.length > 0 ?
                `${this.activityChartTitle} (Favorites)` :
                `${this.activityChartTitle} (Active Jobs)`;
        });
    }
}
