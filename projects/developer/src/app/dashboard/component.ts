import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { JobTypesApiService } from '../configuration/job-types/api.service';
import { DashboardJobsService } from './jobs.service';
import { ColorService } from '../common/services/color.service';

@Component({
    selector: 'dev-dashboard',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    loadingJobTypes: boolean;
    columnsFavs: any[];
    columnsAll: any[];
    subscription: any;
    allJobTypes: any[];
    allJobTypesTooltip: string;
    favoriteJobTypes: any[];
    favorteJobTypesTooltip: string;
    pieChartOptions: any;
    totalAll: number;
    failedAll: number;
    dataAll: any;
    totalFavs: number;
    failedFavs: number;
    dataFavs: any;
    dataFeedChartTitle: string;
    historyChartTitle: string;
    activityChartTitle: string;

    constructor(
        private messageService: MessageService,
        private jobTypesApiService: JobTypesApiService,
        private jobsService: DashboardJobsService
    ) {
        this.columnsFavs = [
            { field: 'title', header: 'Title', filterMatchMode: 'contains' }
        ];
        this.columnsAll = [
            { field: 'job_type.title', header: 'Title', filterMatchMode: 'contains' }
        ];
        this.allJobTypes = [];
        this.favoriteJobTypes = [];
        this.pieChartOptions = {
            rotation: 0.5 * Math.PI, // start from bottom
            cutoutPercentage: 40,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            plugins: {
                datalabels: false
            },
            elements: {
                arc: {
                    borderWidth: 0
                }
            }
        };
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
        const chartData = {
            datasets: [{
                data: [sysErrors, algErrors, dataErrors],
                borderColor: '#fff',
                borderWidth: 1,
                backgroundColor: [
                    ColorService.ERROR_SYSTEM,   // system
                    ColorService.ERROR_ALGORITHM,  // algorithm
                    ColorService.ERROR_DATA  // data
                ]
            }],
            labels: ['SYSTEM', 'ALGORITHM', 'DATA']
        };
        return {
            total: total,
            failed: failed,
            chartData: chartData
        };
    }

    private refreshAllJobTypes() {
        this.loadingJobTypes = true;
        this.unsubscribe();
        this.subscription = this.jobTypesApiService.getJobTypeStatus(true).subscribe(data => {
            this.allJobTypes = data.results;
            this.jobsService.setAllJobs(this.allJobTypes);

            const favs = [];
            this.allJobTypes.forEach(jt => {
                if (this.jobsService.isFavorite(jt.job_type)) {
                    favs.push(jt);
                }
            });
            this.favoriteJobTypes = favs;
            this.loadingJobTypes = false;

            const totalJobStats = this.generateStats(data.results);
            this.totalAll = totalJobStats.total;
            this.failedAll = totalJobStats.failed;
            this.dataAll = totalJobStats.chartData;

            const favoriteJobStats = this.generateStats(this.favoriteJobTypes);
            this.totalFavs = favoriteJobStats.total;
            this.failedFavs = favoriteJobStats.failed;
            this.dataFavs = favoriteJobStats.chartData;
            this.allJobTypesTooltip = this.allJobTypes.length > 0 && this.failedAll > 0 ?
                `${this.failedAll} Failure(s) / ${this.totalAll} Total` : null;
            this.favorteJobTypesTooltip = this.favoriteJobTypes.length > 0 && this.failedFavs > 0 ?
                `${this.failedFavs} Failure(s) / ${this.totalFavs} Total` : null;

            this.dataFeedChartTitle = 'Data Feed';
            this.dataFeedChartTitle = favs.length > 0 ?
                `${this.dataFeedChartTitle} (Favorites)` :
                `${this.dataFeedChartTitle} (All Job Types)`;
            this.historyChartTitle = 'Completed vs. Failed counts';
            this.historyChartTitle = favs.length > 0 ?
                `${this.historyChartTitle} (Favorites)` :
                `${this.historyChartTitle} (All Job Types)`;
            this.activityChartTitle = 'Job Activity';
            this.activityChartTitle = favs.length > 0 ?
                `${this.activityChartTitle} (Favorites)` :
                `${this.activityChartTitle} (All Job Types)`;
        }, err => {
            this.loadingJobTypes = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type status', detail: err.statusText});
        });
    }
}
