import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/primeng';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as _ from 'lodash';

import { JobTypesApiService } from './api.service';
import { ColorService } from '../../common/services/color.service';
import { WorkspacesApiService } from '../../system/workspaces/api.service';
import { ScansApiService } from '../../system/scans/api.service';

@Component({
    selector: 'dev-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobTypesComponent implements OnInit, OnDestroy {
    private routeParams: any;
    jobTypes: SelectItem[];
    selectedJobType: any;
    selectedJobTypeDetail: any;
    options: any;
    items: MenuItem[];
    itemsWithPause: MenuItem[] = [
        { label: 'Pause', icon: 'fa fa-pause', command: () => { this.onPauseClick(); } },
        { label: 'Edit', icon: 'fa fa-edit', command: () => { this.onEditClick(); } },
        { label: 'Scan', icon: 'fa fa-barcode', command: () => { this.scanDisplay = true; } }
    ];
    itemsWithResume: MenuItem[] = [
        { label: 'Resume', icon: 'fa fa-play', command: () => { this.onPauseClick(); } },
        { label: 'Edit', icon: 'fa fa-edit', command: () => { this.onEditClick(); } },
        { label: 'Scan', icon: 'fa fa-barcode', command: () => { this.scanDisplay = true; } }
    ];
    scanDisplay: boolean;
    workspaces: SelectItem[] = [];
    selectedWorkspace: any;
    isScanning: boolean;
    scanProgress = 0;
    scanBtnIcon = 'fa fa-barcode';
    interfaceClass = 'p-col-6';
    errorClass = 'p-col-6';

    constructor(
        private messageService: MessageService,
        private jobTypesApiService: JobTypesApiService,
        private colorService: ColorService,
        private workspacesApiService: WorkspacesApiService,
        private scansApiService: ScansApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    private getJobTypeDetail(name: string, version: string) {
        this.jobTypesApiService.getJobType(name, version).subscribe(data => {
            this.selectedJobTypeDetail = data;
            if (data.manifest.job.interface && data.manifest.job.errors) {
                this.interfaceClass = 'p-col-6';
                this.errorClass = 'p-col-6';
            } else if (data.manifest.job.interface && !data.manifest.job.errors) {
                this.interfaceClass = 'p-col-12';
            } else if (!data.manifest.job.interface && data.manifest.job.errors) {
                this.errorClass = 'p-col-12';
            }
            this.items = this.selectedJobTypeDetail.is_paused ? _.clone(this.itemsWithResume) : _.clone(this.itemsWithPause);
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type details', detail: err.statusText, life: 10000});
        });
    }
    private getJobTypes(name?: string, version?: string) {
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            _.forEach(data.results, result => {
                this.jobTypes.push({
                    label: `${result.title} ${result.version}`,
                    value: result
                });
                if (name === result.name && version === result.version) {
                    this.selectedJobType = result;
                }
            });
            if (name && version) {
                this.getJobTypeDetail(name, version);
            }
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type', detail: err.statusText});
        });
    }
    private getWorkspaces() {
        this.workspacesApiService.getWorkspaces().subscribe(data => {
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
        this.scanBtnIcon = 'fa fa-barcode';
        this.scanProgress = 0;
        this.messageService.add({severity: 'error', summary: 'Error creating scan', detail: err.statusText});
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onRowSelect(e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/configuration/job-types/${e.value.name}/${e.value.version}`);
        } else {
            this.router.navigate([`/configuration/job-types/${e.value.name}/${e.value.version}`]);
        }
    }
    onPauseClick() {
        this.selectedJobTypeDetail.is_paused = !this.selectedJobTypeDetail.is_paused;
        this.jobTypesApiService.updateJobType(this.selectedJobTypeDetail).subscribe(data => {
            this.selectedJobTypeDetail = data;
            this.items = this.selectedJobTypeDetail.is_paused ? _.clone(this.itemsWithResume) : _.clone(this.itemsWithPause);
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error updating job type', detail: err.statusText});
        });
    }
    onEditClick() {
        this.router.navigate([`/configuration/job-types/edit/${this.selectedJobTypeDetail.name}/${this.selectedJobTypeDetail.version}`]);
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
        this.scanBtnIcon = 'fa fa-spinner fa-spin';
        this.jobTypesApiService.scanJobTypeWorkspace(scanObj).subscribe(() => {
            const rand = Math.floor(Math.random() * 1000000000);
            const scan = {
                name: `my-scan-process-${rand}`,
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
            this.scansApiService.createScan(scan).subscribe(scanResult => {
                // then use the id that comes back from the above request and do a process scan
                this.scansApiService.processScan(scanResult.id).subscribe(() => {
                    this.scanProgress = 0;
                    this.scanDisplay = false; // hide scan dialog
                    this.isScanning = false; // done scanning
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Scan Process',
                        detail: 'Scan process has been successfully launched'
                    });
                });
            }, err => {
                this.handleScanError(err);
            });
        }, err => {
            this.handleScanError(err);
        });
    }
    createNewJobType() {
        this.router.navigate(['/configuration/job-types/create']);
    }
    ngOnInit() {
        this.options = {
            legend: false,
            cutoutPercentage: 40,
            plugins: {
                datalabels: false
            }
        };
        this.getWorkspaces();

        this.jobTypes = [];
        let name = null;
        let version = null;
        if (this.route && this.route.paramMap) {
            this.routeParams = this.route.paramMap.subscribe(params => {
                name = params.get('name');
                version = params.get('version');
                this.getJobTypes(name, version);
            });
        }
    }
    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
