import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';

import { SourceFilesApiService } from './api.service';
import { SourceFile } from './api.model';
import { SourceFilesDatatable } from './datatable.model';
import { SourceFilesDatatableService } from './datatable.service';

@Component({
    selector: 'app-source-files',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class SourceFilesComponent implements OnInit {
    datatableOptions: SourceFilesDatatable;
    sourceFiles: SourceFile[];
    first: number;
    count: number;
    fileName: string;
    isInitialized: boolean;

    constructor(
        private sourceFilesDatatableService: SourceFilesDatatableService,
        private sourceFilesApiService: SourceFilesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.isInitialized = false;
    }

    private updateData() {
        this.sourceFilesApiService.getSourceFiles(this.datatableOptions).then(data => {
            this.count = data.count;
            this.sourceFiles = data.results as SourceFile[];
        });
    }
    private updateOptions() {
        this.datatableOptions = _.pickBy(this.datatableOptions, (d) => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        this.sourceFilesDatatableService.setSourceFilesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/data/source-files'], {
            queryParams: this.datatableOptions
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
        console.log(e);
        // let ngOnInit handle loading data to ensure query params are respected
        if (this.isInitialized) {
            this.datatableOptions = Object.assign(this.datatableOptions, {
                first: 0,
                sortField: e.sortField,
                sortOrder: e.sortOrder
            });
            this.updateOptions();
        } else {
            // data was just loaded by ngOnInit, so set flag to true
            this.isInitialized = true;
        }
    }
    onRowSelect(e) {
        this.router.navigate(['/data/source-files/' + e.data.id]);
    }
    ngOnInit() {
        if (this.route.snapshot &&
            Object.keys(this.route.snapshot.queryParams).length > 0) {

            const params = this.route.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: parseInt(params.rows, 10),
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                started: params.started,
                ended: params.ended,
                time_field: params.time_field,
                is_parsed: params.is_parsed,
                file_name: params.file_name
            };
        } else {
            this.datatableOptions = this.sourceFilesDatatableService.getSourceFilesDatatableOptions();
        }
        this.updateOptions();
    }
}
