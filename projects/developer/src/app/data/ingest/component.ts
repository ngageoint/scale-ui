import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
        this.router.navigate(['/data/ingest'], {
            queryParams: this.datatableOptions,
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
    onDateFilterApply(data: any) {
        if (this.sub) {
            this.sub.unsubscribe();
            this.sub = null;
        }
        this.ingests = null;
        this.started = data.started;
        this.ended = data.ended;
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: moment.utc(this.started, environment.dateFormat).toISOString(),
            ended: moment.utc(this.ended, environment.dateFormat).toISOString()
        });
        this.updateOptions();
    }
    getDateRangeSelected(data: any) {
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
    onDateRangeSelected(data: any) {
        if (this.sub) {
            this.sub.unsubscribe();
            this.sub = null;
        }
        this.sub = Observable.timer(0, 10000)
            .subscribe(() => {
                this.getDateRangeSelected(data);
            });
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
        }
        this.ingests = [];
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
            this.started = moment.utc(this.datatableOptions.started).format(environment.dateFormat);
            this.ended = moment.utc(this.datatableOptions.ended).format(environment.dateFormat);
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
