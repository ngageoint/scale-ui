import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/timer';
import * as moment from 'moment';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { DataService } from '../../common/services/data.service';
import { IngestApiService } from './api.service';
import { Ingest } from './api.model';
import { IngestDatatable } from './datatable.model';
import { IngestDatatableService } from './datatable.service';
import { StrikesApiService } from '../../system/strikes/api.service';

@Component({
    selector: 'dev-ingest',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class IngestComponent implements OnInit, OnDestroy {
    dateFormat = environment.dateFormat;
    ingests: any;
    selectedIngest: any;
    selectedRows: any;
    datatableOptions: IngestDatatable;
    datatableLoading: boolean;
    columns = [
        { field: 'file_name', header: 'File Name' },
        { field: 'file_size', header: 'File Size' },
        { field: 'strike.id', header: 'Strike Process' },
        { field: 'status', header: 'Status' },
        { field: 'transfer_started', header: 'Transfer Started (Z)' },
        { field: 'transfer_ended', header: 'Transfer Ended (Z)' },
        { field: 'ingest_started', header: 'Ingest Started (Z)' },
        { field: 'ingest_ended', header: 'Ingest Ended (Z)' }
    ];
    strikeValues: SelectItem[];
    selectedStrike: any = [];
    statusValues: SelectItem[] = [{
        label: 'Transferring',
        value: 'TRANSFERRING'
    }, {
        label: 'Transferred',
        value: 'TRANSFERRED'
    }, {
        label: 'Queued',
        value: 'QUEUED'
    }, {
        label: 'Deferred',
        value: 'DEFERRED'
    }, {
        label: 'Ingesting',
        value: 'INGESTING'
    }, {
        label: 'Ingested',
        value: 'INGESTED'
    }, {
        label: 'Errored',
        value: 'ERRORED'
    }, {
        label: 'Duplicate',
        value: 'DUPLICATE'
    }];
    selectedStatus: any = [];
    count: number;
    started: string;
    ended: string;
    filename: string;
    isInitialized = false;
    subscription: any;
    isMobile: boolean;
    nameFilterText: string;
    sub: any;
    onNameFilter = _.debounce((e) => {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            file_name: e.target.value
        });
        this.updateOptions();
    }, 1000);
    liveRange: number;

    constructor(
        private dataService: DataService,
        private ingestDatatableService: IngestDatatableService,
        private ingestApiService: IngestApiService,
        private strikesApiService: StrikesApiService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private breakpointObserver: BreakpointObserver
    ) {}

    private updateData() {
        if (!this.sub) {
            this.datatableLoading = true;
        }
        this.unsubscribe();

        // don't show loading state when in live mode
        if (!this.liveRange) {
            this.datatableLoading = true;
        }

        this.subscription = this.ingestApiService.getIngests(this.datatableOptions, true).subscribe(data => {
            this.datatableLoading = false;
            this.count = data.count;
            _.forEach(data.results, result => {
                const ingest = _.find(this.selectedRows, { data: { id: result.id } });
                result.selected =  !!ingest;
            });
            this.ingests = Ingest.transformer(data.results);
        }, err => {
            this.datatableLoading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving ingests', detail: err.statusText});
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        this.ingestDatatableService.setIngestDatatableOptions(this.datatableOptions);

        // update router params
        const params = this.datatableOptions as Params;
        if (params.liveRange) {
            // if live range was set on the table options, remove started/ended
            delete params.started;
            delete params.ended;
        } else {
            // live range not provided, default back to started/ended set on table options
            params.started = params.started || this.started;
            params.ended = params.ended || this.ended;
        }

        this.router.navigate(['/data/ingest'], {
            queryParams: params,
            replaceUrl: true
        });
    }
    private getStrikes() {
        this.selectedStrike = [];
        this.strikesApiService.getStrikes().subscribe(data => {
            const selectItems = [];
            _.forEach(data.results, strike => {
                selectItems.push({
                    label: strike.title,
                    value: strike
                });
                if (_.indexOf(this.datatableOptions.strike_id, strike.id) >= 0) {
                    this.selectedStrike.push(strike);
                }
            });
            this.strikeValues = _.orderBy(selectItems, ['title'], ['asc']);
            this.updateData();
        }, err => {
            this.messageService.add({severity: 'error', summary: 'Error retrieving strikes', detail: err.statusText});
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
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
    onStrikeChange(e) {
        const strikeId = _.map(e.value, 'id');
        this.datatableOptions.strike_id = strikeId.length > 0 ? strikeId : null;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0
        });
        this.updateOptions();
    }
    onStatusChange(e) {
        this.datatableOptions.status = e.value || null;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0
        });
        this.updateOptions();
    }
    onRowSelect(e) {
        if (!_.find(this.selectedRows, { data: { id: e.data.id } })) {
            this.dataService.setSelectedIngestRows(e);
        }
        if (e.data.job) {
            if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
                window.open(`/processing/jobs/${e.data.job.id}`);
            } else {
                this.router.navigate([`/processing/jobs/${e.data.job.id}`]);
            }
        } else {
            this.messageService.add({severity: 'error', summary: 'Job not found', detail: 'There is no job associated with this ingest'});
            setTimeout(() => {
                this.selectedIngest = null;
            });
        }
    }
    getJobURL(job: any): string {
        if (job) {
            return `/processing/jobs/${job.id}`;
        }
        return '';
    }

    /**
     * Callback for temporal filter updating the start/end range filter.
     * @param data start and end strings of iso formatted datetimes
     */
    onDateFilterSelected(data: {start: string, end: string}): void {
        // keep local model in sync
        this.started = data.start;
        this.ended = data.end;
        // patch in the values to the datatable
        this.datatableOptions = Object.assign(this.datatableOptions, {
            started: data.start,
            ended: data.end
        });
        // update router
        this.updateOptions();
    }

    /**
     * Callback for temporal filter updating the live range selection.
     * @param data hours that should be used, or null to clear
     */
    onLiveRangeSelected(data: {hours: number}): void {
        // keep model in sync
        this.liveRange = data.hours;
        // patch in the values for datatable
        this.datatableOptions = Object.assign(this.datatableOptions, {
            liveRange: data.hours
        });
        // update router
        this.updateOptions();
    }

    /**
     * Callback for when temporal filter tells this component to update visible date range. This is
     * the signal that either a date range or a live range is being triggered.
     * @param data start and end iso strings for what dates should be filtered
     */
    onTemporalFilterUpdate(data: {start: string, end: string}): void {
        // update the datatable options then call the api
        this.datatableOptions = Object.assign(this.datatableOptions, {
                first: 0,
                started: data.start,
                ended: data.end
            });
        this.updateData();
    }

    onFilterClick(e) {
        e.stopPropagation();
    }
    ngOnInit() {
        this.breakpointObserver.observe(['(min-width: 1220px)']).subscribe((state: BreakpointState) => {
            this.isMobile = !state.matches;
        });
        this.selectedRows = this.dataService.getSelectedIngestRows();
        if (!this.datatableOptions) {
            this.datatableOptions = this.ingestDatatableService.getIngestDatatableOptions();
            // let temporal filter set the start/end
            this.datatableOptions.started = null;
            this.datatableOptions.ended = null;
        }

        this.ingests = [];
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: params.first ? parseInt(params.first, 10) : 0,
                    rows: params.rows ? parseInt(params.rows, 10) : 10,
                    sortField: params.sortField ? params.sortField : 'last_modified',
                    sortOrder: params.sortOrder ? parseInt(params.sortOrder, 10) : -1,
                    started: params.started || this.datatableOptions.started,
                    ended: params.ended || this.datatableOptions.ended,
                    liveRange: params.liveRange ? parseInt(params.liveRange, 10) : null,
                    duration: params.duration ? params.duration : null,
                    status: params.status ?
                        Array.isArray(params.status) ?
                            params.status :
                            [params.status]
                        : null,
                    scan_id: params.scan_id ? +params.scan_id : null,
                    strike_id: params.strike_id ?
                        Array.isArray(params.strike_id) ?
                            params.strike_id.map(id => {
                                return +id;
                            }) :
                            [+params.strike_id]
                        : null,
                    file_name: params.file_name || null
                };
                this.nameFilterText = this.datatableOptions.file_name;
                this.updateData();
            }
            this.selectedStatus = [];
            _.forEach(this.statusValues, status => {
                if (_.indexOf(this.datatableOptions.status, status.value) >= 0) {
                    this.selectedStatus.push(status.value);
                }
            });
            this.started = this.datatableOptions.started;
            this.ended = this.datatableOptions.ended;
            this.liveRange = this.datatableOptions.liveRange;
            this.getStrikes();
        });
    }
    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
        this.unsubscribe();
    }
}
