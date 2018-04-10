import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SelectItem } from 'primeng/primeng';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { JobTypesApiService } from './api.service';
import { ColorService } from '../../color.service';
import { WorkspacesApiService } from '../workspaces/api.service';
import { ScansApiService } from '../../common/scans/api.service';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobTypesComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    jobTypes: SelectItem[];
    selectedJobType: any;
    selectedJobTypeDetail: any;
    // interfaceData: TreeNode[];
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
    items: MenuItem[] = [
        { label: 'Pause', icon: 'fa-pause', command: () => { this.onPauseClick(); } },
        { label: 'Edit', icon: 'fa-edit', command: () => { this.onEditClick(); } },
        { label: 'Scan', icon: 'fa-barcode', command: () => { this.scanDisplay = true; } }
    ];
    scanDisplay: boolean;
    workspaces: SelectItem[] = [];
    selectedWorkspace: any;
    isScanning: boolean;
    scanProgress = 0;
    scanBtnIcon = 'fa-barcode';
    private readonly STATUS_VALUES = ['COMPLETED', 'BLOCKED', 'QUEUED', 'RUNNING', 'FAILED', 'CANCELED', 'PENDING'];
    private readonly CATEGORY_VALUES = ['SYSTEM', 'ALGORITHM', 'DATA'];

    constructor(
        private messageService: MessageService,
        private jobTypesApiService: JobTypesApiService,
        private colorService: ColorService,
        private workspacesApiService: WorkspacesApiService,
        private scansApiService: ScansApiService,
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
                                label: `${result.manifest.job.title} ${result.manifest.job.jobVersion}`,
                                value: result
                            });
                            if (id === result.id) {
                                this.selectedJobType = _.clone(result);
                            }
                        });
                        if (id) {
                            this.getJobTypeDetail(id);
                            this.getWorkspaces();
                        }
                    }, err => {
                        console.log(err);
                        this.messageService.add({severity: 'error', summary: 'Error retrieving job type', detail: err.statusText});
                    });
                });
        }
    }

    // private setInterfaceData(data) {
    //     const dataArr = [];
    //     _.forEach(data, (d) => {
    //         dataArr.push({
    //             data: d
    //         });
    //     });
    //     return dataArr;
    // }
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
            // this.interfaceData = [
            //     {
            //         data: {
            //             name: 'Input Data',
            //             type: '',
            //             media_types: ''
            //         },
            //         children: this.setInterfaceData(data.job_type_interface.input_data)
            //     },
            //     {
            //         data: {
            //             name: 'Output Data',
            //             type: '',
            //             media_type: ''
            //         },
            //         children: this.setInterfaceData(data.job_type_interface.output_data)
            //     }
            // ];
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
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type details', detail: err.statusText});
        });
    }
    private getWorkspaces() {
        this.workspacesApiService.getWorkspaces().then(data => {
            _.forEach(data.results, (result) => {
                this.workspaces.push({
                    label: result.title,
                    value: result
                });
            });
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving workspaces', detail: err.statusText});
        });
    }
    private handleScanError(err) {
        console.log(err);
        this.isScanning = false;
        this.scanBtnIcon = 'fa-barcode';
        this.scanProgress = 0;
        this.messageService.add({severity: 'error', summary: 'Error creating scan', detail: err.statusText});
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onRowSelect(e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/configuration/job-types/${e.value.id}`);
        } else {
            this.router.navigate([`/configuration/job-types/${e.value.id}`]);
        }
    }
    onPauseClick() {
        this.selectedJobTypeDetail.is_paused = !this.selectedJobTypeDetail.is_paused;
        this.jobTypesApiService.updateJobType(this.selectedJobTypeDetail).then(data => {
            this.selectedJobTypeDetail = data;
            this.pauseBtnIcon = this.selectedJobTypeDetail.is_paused ? 'fa-play' : 'fa-pause';
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error updating job type', detail: err.statusText});
        });
    }
    onEditClick() {
        this.router.navigate([`/configuration/job-types/edit/${this.selectedJobTypeDetail.id}`]);
    }
    onScanHide() {
        this.selectedWorkspace = null;
    }
    scanWorkspace() {
        const scanObj = {
            id: this.selectedJobTypeDetail.id,
            trigger_rule: {
                configuration: {
                    condition: {
                        data_types: [],
                        media_type: ''
                    },
                    data: {
                        input_data_name: 'input_file',
                        workspace_name: this.selectedWorkspace.name
                    }
                },
                is_active: true,
                name: `${this.selectedJobTypeDetail.manifest.job.name}-${this.selectedJobTypeDetail.manifest.job.jobVersion}-trigger`,
                type: 'INGEST'
            }
        };
        this.isScanning = true;
        this.scanProgress = 33;
        this.scanBtnIcon = 'fa-spinner fa-spin';
        this.jobTypesApiService.scanJobTypeWorkspace(scanObj).then(() => {
            const scan = {
                name: 'my-scan-process',
                title: 'My Scan Process',
                description: 'This is my Scan',
                configuration: {
                    version: '1.0',
                    workspace: this.selectedWorkspace.name,
                    scanner: {
                        type: 's3',
                    },
                    recursive: true,
                    files_to_ingest: [{
                        filename_regex: '.*'
                    }]
                }
            };
            this.scanProgress = 66;
            this.scansApiService.createScan(scan).then(scanResult => {
                // then use the id that comes back from the above request and do a process scan
                this.scansApiService.processScan(scanResult.id).then(() => {
                    this.scanProgress = 0;
                    this.scanDisplay = false; // hide scan dialog
                    this.isScanning = false; // done scanning
                });
            }, err => {
                this.handleScanError(err);
            });
        }, err => {
            this.handleScanError(err);
        });
    }
    ngOnInit() {
        this.options = {
            legend: false,
            cutoutPercentage: 40,
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
