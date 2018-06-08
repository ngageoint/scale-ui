import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';
import * as moment from 'moment';

import { DataService } from '../../common/services/data.service';
import { SourcesApiService } from './api.service';
import { Source } from './api.model';
import { SourcesDatatable } from './datatable.model';
import { SourcesDatatableService } from './datatable.service';
import { ApiResults } from '../../common/models/api-results.model';

@Component({
    selector: 'app-sources',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class SourcesComponent implements OnInit {
    datatableOptions: SourcesDatatable;
    datatableLoading: boolean;
    columns: any[];
    sources: any;
    first: number;
    count: number;
    started: string = moment.utc().subtract(1, 'd').format('YYYY-MM-DD');
    ended: string = moment.utc().format('YYYY-MM-DD');
    timeFieldOptions: SelectItem[];
    isInitialized: boolean;

    constructor(
        public dataService: DataService,
        private sourcesDatatableService: SourcesDatatableService,
        private sourcesApiService: SourcesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.isInitialized = false;
        this.columns = [
            { field: 'file_name', header: 'File Name' },
            { field: 'file_size_formatted', header: 'File Size' },
            { field: 'data_started', header: 'Data Started' },
            { field: 'data_ended', header: 'Data Ended' },
            { field: 'countries', header: 'Countries' },
            { field: 'last_modified', header: 'Last Modified (Z)' }
        ];
        this.timeFieldOptions = [
            {
                label: 'Data',
                value: 'data'
            },
            {
                label: 'Last Modified',
                value: 'last_modified'
            }
        ];
        this.datatableOptions = this.sourcesDatatableService.getSourcesDatatableOptions();
    }

    private updateData() {
        this.datatableLoading = true;
        this.sourcesApiService.getSources(this.datatableOptions)
            .subscribe(data => {
                this.datatableLoading = false;
                this.count = data.count;
                this.sources = Source.transformer(data.results);
            });
        // this.sourcesApiService.getSources(this.datatableOptions).then(data => {
        //     this.datatableLoading = false;
        //     this.count = data.count;
        //     this.sources = Source.transformer(data.results);
        // }, err => {
        //     this.datatableLoading = false;
        //     console.log(err);
        // });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        this.sourcesDatatableService.setSourcesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/data/sources'], {
            queryParams: this.datatableOptions,
            replaceUrl: true
        });

        this.updateData();
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
            this.datatableOptions = Object.assign(this.datatableOptions, {
                first: 0,
                sortField: e.sortField,
                sortOrder: e.sortOrder,
                file_name: e.filters['file_name'] ? e.filters['file_name']['value'] : null
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onRowSelect(e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/data/sources/${e.data.id}`);
        } else {
            this.router.navigate([`/data/sources/${e.data.id}`]);
        }
    }
    onStartSelect(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            started: moment.utc(e, 'YYYY-MM-DD').toISOString()
        });
        this.updateOptions();
    }
    onEndSelect(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            ended: moment.utc(e, 'YYYY-MM-DD').toISOString()
        });
        this.updateOptions();
    }
    onTimeFieldChange(e) {
        this.datatableOptions = Object.assign(this.datatableOptions, {
            first: 0,
            time_field: e.value
        });
        this.updateOptions();
    }
    onFilterClick(e) {
        e.stopPropagation();
    }
    ngOnInit() {
        this.datatableLoading = true;
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    first: +params.first || 0,
                    rows: +params.rows || 10,
                    sortField: params.sortField || 'last_modified',
                    sortOrder: +params.sortOrder || -1,
                    started: params.started ? params.started : moment.utc().subtract(1, 'd').startOf('h').toISOString(),
                    ended: params.ended ? params.ended : moment.utc().startOf('h').toISOString(),
                    time_field: params.time_field || 'data',
                    is_parsed: params.is_parsed || null,
                    file_name: params.file_name || null
                };
            } else {
                this.datatableOptions = this.sourcesDatatableService.getSourcesDatatableOptions();
            }
            this.started = moment.utc(this.datatableOptions.started).format('YYYY-MM-DD');
            this.ended = moment.utc(this.datatableOptions.ended).format('YYYY-MM-DD');
            this.updateOptions();
        });
    }
}
