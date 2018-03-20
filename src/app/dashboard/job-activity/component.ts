import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import * as _ from 'lodash';

import { ColorService } from '../../color.service';
import { JobsApiService } from '../../processing/jobs/api.service';
import { DashboardJobsService } from '../jobs.service';
import { UIChart } from 'primeng/primeng';

@Component({
    selector: 'app-job-activity',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class JobActivityComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('chart') chart: UIChart;
    chartLoading: boolean;
    params: any;
    subscription: any;
    favoritesSubscription: any;
    favorites = [];
    allJobs = [];
    data: any;
    options: any;

    constructor(
        private colorService: ColorService,
        private jobsApiService: JobsApiService,
        private jobsService: DashboardJobsService,
        private messageService: MessageService
    ) {}

    private updateData() {
        this.chartLoading = true;
        this.unsubscribe();
        this.favorites = this.jobsService.getFavorites();
        this.allJobs = this.jobsService.getAllJobs();
        this.params = {
            started: moment.utc().subtract(1, 'd').toISOString(),
            ended: moment.utc().toISOString(),
            job_type_id: this.favorites.length > 0 ? _.map(this.favorites, 'id') : _.map(this.allJobs, 'job_type.id')
        };
        this.subscription = this.jobsApiService.getJobLoad(this.params, true).subscribe(data => {
            this.chartLoading = false;
            this.data = {
                datasets: [{
                    label: 'Running',
                    backgroundColor: this.colorService.RUNNING,
                    borderColor: '#9dd3ff',
                    borderWidth: 2,
                    data: []
                }, {
                    label: 'Queued',
                    backgroundColor: this.colorService.QUEUED,
                    borderColor: '#9dd3ff',
                    borderWidth: 2,
                    data: []
                }, {
                    label: 'Pending',
                    backgroundColor: this.colorService.PENDING,
                    borderColor: '#9dd3ff',
                    borderWidth: 2,
                    data: []
                }]
            };
            _.forEach(this.data.datasets, dataset => {
                _.forEach(data.results, result => {
                    dataset.data.push({
                        x: moment.utc(result.time).toDate(),
                        y: dataset.label === 'Pending' ?
                            result.pending_count :
                            dataset.label === 'Queued' ?
                                result.queued_count :
                                result.running_count
                    });
                });
            });
        }, err => {
            this.chartLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving job load', detail: err.statusText});
        });
    }

    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.chartLoading = true;
        this.options = {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        displayFormats: {
                            hour: 'DD MMM HHmm[Z]'
                        }
                    },
                    ticks: {
                        callback: (value, index, values) => {
                            if (!values[index]) {
                                return;
                            }
                            return moment.utc(values[index]['value']).format('DD MMM HHmm[Z]');
                        }
                    }
                }],
                yAxes: [{
                    stacked: true
                }]
            },
            plugins: {
                datalabels: false
            },
            maintainAspectRatio: false
        };
        this.updateData();
        this.favoritesSubscription = this.jobsService.favoritesUpdated.subscribe(() => {
            this.updateData();
        });
    }

    ngAfterViewInit() {
        if (this.chart.chart) {
            this.chart.chart.canvas.parentNode.style.height = '360px';
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
        this.favoritesSubscription.unsubscribe();
    }
}
