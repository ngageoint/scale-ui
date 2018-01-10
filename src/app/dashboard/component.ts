import { Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { JobTypesApiService } from '../configuration/job-types/api.service';
import { DashboardFavoritesService } from './favorites.service';


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

    constructor(
        private jobTypesApiService: JobTypesApiService,
        private favoritesService: DashboardFavoritesService
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
        this.favoritesService.favoritesUpdated.subscribe(() => {
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
            console.log(data.results.length, this.activeJobTypes.length);

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
                if (this.favoritesService.isFavorite(jt.job_type.id)) {
                    favs.push(jt);
                }
            });
            this.favoriteJobTypes = favs;
        });
    }
}
