import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SelectItem, TreeNode } from 'primeng/primeng';
import * as _ from 'lodash';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { JobTypesApiService } from './api.service';
import { ColorService } from '../../color.service';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobTypesComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    jobTypes: SelectItem[];
    selectedJobType: SelectItem;
    selectedJobTypeDetail: any;
    interfaceData: TreeNode[];
    chartData6h: any;
    total6h: number;
    failed6h: number;
    chartData12h: any;
    total12h: number;
    failed12h: number;
    chartData24h: any;
    total24h: number;
    failed24h: number;
    options: any;
    pauseBtnIcon = 'fa-pause';
    private readonly STATUS_VALUES = ['COMPLETED', 'BLOCKED', 'QUEUED', 'RUNNING', 'FAILED', 'CANCELED', 'PENDING'];
    private readonly CATEGORY_VALUES = ['SYSTEM', 'ALGORITHM', 'DATA'];

    constructor(
        private jobTypesApiService: JobTypesApiService,
        private colorService: ColorService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        if (this.router.events) {
            this.routerEvents = this.router.events
                .filter((event) => event instanceof NavigationEnd)
                .map(() => this.route)
                .subscribe(() => {
                    this.jobTypes = [];
                    let id = null;
                    if (this.route && this.route.paramMap) {
                        this.routeParams = this.route.paramMap.subscribe(params => {
                            id = +params.get('id');
                        });
                    }
                    this.jobTypesApiService.getJobTypes().then(data => {
                        _.forEach(data.results, (result) => {
                            this.jobTypes.push({
                                label: result.title + ' ' + result.version,
                                value: result
                            });
                            if (id === result.id) {
                                this.selectedJobType = _.clone(result);
                            }
                        });
                        if (id) {
                            this.getJobTypeDetail(id);
                        }
                    });
                });
        }
    }

    private setInterfaceData(data) {
        const dataArr = [];
        _.forEach(data, (d) => {
            dataArr.push({
                data: d
            });
        });
        return dataArr;
    }
    private getChartData(data) {
        const returnData = {
            labels: _.map(data, 'status'),
            datasets: [{
                data: _.map(data, 'count'),
                backgroundColor: []
            }]
        };
        _.forEach(data, d => {
            returnData.datasets[0].backgroundColor.push(this.colorService[_.toUpper(d.status)]);
        });
        return returnData;
    }
    private getChartTotals(data: any, type: string): number {
        if (type === 'total') {
            return _.sum(_.map(_.filter(data, jobCount => {
                return jobCount.status !== 'RUNNING';
            }), 'count'));
        }
        return _.sum(_.map(_.filter(data, jobCount => {
            return jobCount.status === 'FAILED';
        }), 'count'));
    }
    private getJobTypeDetail(id: number) {
        this.jobTypesApiService.getJobType(id).then(data => {
            this.interfaceData = [
                {
                    data: {
                        name: 'Input Data',
                        type: '',
                        media_types: ''
                    },
                    children: this.setInterfaceData(data.job_type_interface.input_data)
                },
                {
                    data: {
                        name: 'Output Data',
                        type: '',
                        media_type: ''
                    },
                    children: this.setInterfaceData(data.job_type_interface.output_data)
                }
            ];
            this.chartData6h = this.getChartData(data.job_counts_6h);
            this.total6h = this.getChartTotals(data.job_counts_6h, 'total');
            this.failed6h = this.getChartTotals(data.job_counts_6h, 'failed');
            this.chartData12h = this.getChartData(data.job_counts_12h);
            this.total12h = this.getChartTotals(data.job_counts_12h, 'total');
            this.failed12h = this.getChartTotals(data.job_counts_12h, 'failed');
            this.chartData24h = this.getChartData(data.job_counts_24h);
            this.total24h = this.getChartTotals(data.job_counts_24h, 'total');
            this.failed24h = this.getChartTotals(data.job_counts_24h, 'failed');
            this.selectedJobTypeDetail = data;
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onRowSelect(e) {
        this.router.navigate([`/configuration/job-types/${e.value.id}`]);
    }
    onPauseClick() {
        this.selectedJobTypeDetail.is_paused = !this.selectedJobTypeDetail.is_paused;
        this.jobTypesApiService.updateJobType(this.selectedJobTypeDetail).then(data => {
            this.selectedJobTypeDetail = data;
            this.pauseBtnIcon = this.selectedJobTypeDetail.is_paused ? 'fa-play' : 'fa-pause';
        });
    }
    onEditClick() {
        this.router.navigate([`/configuration/job-types/edit/${this.selectedJobTypeDetail.id}`]);
    }
    ngOnInit() {
        this.options = {
            legend: false,
            cutoutPercentage: 65,
            plugins: {
                datalabels: false
            }
        };
    }
    ngOnDestroy() {
        this.routerEvents.unsubscribe();
        this.routeParams.unsubscribe();
    }
}
