import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { DataService } from '../../common/services/data.service';
import { ScansApiService } from './api.service';
import { ScansDatatable } from './datatable.model';
import { ScansDatatableService } from './datatable.service';

@Component({
    selector: 'dev-scans',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class ScansComponent implements OnInit, OnDestroy {
    scans: any;
    selectedScan: any;
    selectedRows: any;
    datatableLoading: boolean;
    datatableOptions: ScansDatatable;
    columns = [
        { field: 'name', header: 'Name' },
        { field: 'file_count', header: 'File Count' },
        { field: 'job', header: 'Job' },
        { field: 'created', header: 'Created (Z)' },
        { field: 'last_modified', header: 'Last Modified (Z)' }
    ];
    count: number;
    started: string;
    ended: string;
    isInitialized = false;
    subscription: any;
    isMobile: boolean;
    applyBtnClass = 'ui-button-secondary';
    nameFilterText: string;
    onNameFilter = _.debounce((e) => {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            name: e.target.value
        });
        this.updateOptions();
    }, 1000);

    constructor(
        private dataService: DataService,
        private scansDatatableService: ScansDatatableService,
        private scansApiService: ScansApiService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        public breakpointObserver: BreakpointObserver
    ) {}



    private updateData() {
        this.datatableLoading = true;
        this.unsubscribe();
        this.subscription = this.scansApiService.getScans(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            _.forEach(data.results, result => {
                const scan = _.find(this.selectedRows, { data: { id: result.id } });
                result.selected =  !!scan;
            });
            this.scans = data.results;
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving scans', detail: err.statusText});
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });

        this.scansDatatableService.setScansDatatableOptions(this.datatableOptions);
        this.router.navigate(['/system/scans'], {
            queryParams: this.datatableOptions,
            replaceUrl: true
        });
    }
    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    paginate(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: e.first,
            rows: parseInt(e.rows, 10)
        });
        this.updateOptions();
    }
    onLazyLoad(e: LazyLoadEvent) {
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            if (e.sortField !== this.datatableOptions.sortField || e.sortOrder !== this.datatableOptions.sortOrder) {
                this.datatableOptions = Object.assign(this.datatableOptions, {
                    first: 0,
                    sortField: e.sortField,
                    sortOrder: e.sortOrder
                });
            }
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onRowSelect(e) {
        if (!_.find(this.selectedRows, { data: { id: e.data.id } })) {
            this.dataService.setSelectedBatchRows(e);
        }
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey || e.originalEvent.which === 2) {
            window.open(this.getScanURL(e.data));
        } else {
            this.router.navigate([this.getScanURL(e.data)]);
        }
    }
<<<<<<< HEAD
    onDateFilterApply(data: any) {
=======
    /**
     * Get the router link for the scans URL.
     * @param  scan the scan data containing an id field
     * @return      the URL to the scans page
     */
    getScanURL(scan: any): string {
        return `/system/scans/${scan.id}`;
    }
    onStartSelect(e) {
        this.started = moment.utc(e, environment.dateFormat).startOf('d').format(environment.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }
    onEndSelect(e) {
        this.ended = moment.utc(e, environment.dateFormat).endOf('d').format(environment.dateFormat);
        this.applyBtnClass = 'ui-button-primary';
    }
    onDateFilterApply() {
>>>>>>> parent of 5eb704b... Revert "Merge branch 'master' into issue-162"
        this.scans = null;
        this.started = data.started;
        this.ended = data.ended;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: moment.utc(this.started, environment.dateFormat).toISOString(),
            ended: moment.utc(this.ended, environment.dateFormat).toISOString()
        });
        this.updateOptions();
    }
    onDateRangeSelected(data: any) {
        this.scans = null;
        this.started = moment.utc().subtract(data.range, data.unit).toISOString();
        this.ended = moment.utc().toISOString();
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: this.started,
            ended: this.ended,
            duration: moment.duration(data.range, data.unit).toISOString()
        });
        this.updateOptions();
    }
    onCreateClick(e) {
        if (e.ctrlKey || e.metaKey) {
            window.open('/system/scans/create');
        } else {
            this.router.navigate([`/system/scans/create`]);
        }
    }
    ngOnInit() {
        this.selectedRows = this.dataService.getSelectedScanRows();

        this.breakpointObserver.observe(['(min-width: 1220px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });

        if (!this.datatableOptions) {
            this.datatableOptions = this.scansDatatableService.getScansDatatableOptions();
        }
        this.scans = [];
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: params.first ? parseInt(params.first, 10) : 0,
                    rows: params.rows ? parseInt(params.rows, 10) : 10,
                    sortField: params.sortField ? params.sortField : 'last_modified',
                    sortOrder: params.sortOrder ? parseInt(params.sortOrder, 10) : -1,
                    started: params.started ? params.started : moment.utc().subtract(1, 'd').startOf('d').toISOString(),
                    ended: params.ended ? params.ended : moment.utc().endOf('d').toISOString(),
                    duration: params.duration ? params.duration : null,
                    name: params.name || null
                };
            }
            this.started = moment.utc(this.datatableOptions.started).format(environment.dateFormat);
            this.ended = moment.utc(this.datatableOptions.ended).format(environment.dateFormat);
            this.nameFilterText = this.datatableOptions.name;
            this.updateData();
        });
    }
    ngOnDestroy() {
        this.unsubscribe();
    }
}
