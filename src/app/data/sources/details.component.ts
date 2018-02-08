import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { Source } from './api.model';
import { SourcesApiService } from './api.service';
import { DataService } from '../../data.service';
import { initialJobsDatatable, JobsDatatable } from '../../processing/jobs/datatable.model';
import { Job } from '../../processing/jobs/api.model';

@Component({
    selector: 'app-source-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class SourceDetailsComponent implements OnInit {
    source: Source;
    metadataKeys: string[];
    metadataDisplay: boolean;
    jobsData: any;
    jobsDatatableOptions: JobsDatatable;

    constructor(
        private route: ActivatedRoute,
        private sourcesApiService: SourcesApiService,
        private dataService: DataService
    ) {
        this.jobsDatatableOptions = _.clone(initialJobsDatatable);
    }

    private getSourceJobs() {
        this.sourcesApiService.getSourceDescendants(this.source.id, 'jobs', this.jobsDatatableOptions)
            .then(data => {
                this.jobsData = Job.transformer(data.results);
            });
    }
    formatFilesize(filesize) {
        return this.dataService.calculateFileSizeFromBytes(filesize, 0);
    }
    formatDate(date) {
        return this.dataService.formatDate(date);
    }
    showMetadata() {
        this.metadataDisplay = true;
    }
    onJobsDatatableChange(datatableOptions: JobsDatatable) {
        this.jobsDatatableOptions = datatableOptions;
        if (this.source.id) {
            this.getSourceJobs();
        }
    }
    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.sourcesApiService.getSource(id).then(data => {
                this.source = data as Source;
                this.metadataKeys = _.keys(this.source.meta_data);
                // this.getSourceJobs();
            });
        }
    }
}
