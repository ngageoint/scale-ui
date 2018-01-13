import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { Source } from './api.model';
import { SourcesApiService } from './api.service';
import { DataService } from '../../data.service';
import { JobsDatatableService } from '../../processing/jobs/datatable.service';
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
    jobsData: Job[];
    constructor(
        private route: ActivatedRoute,
        private sourcesApiService: SourcesApiService,
        private jobsDatatableService: JobsDatatableService,
        private dataService: DataService
    ) {}

    private getSourceJobs() {
        this.sourcesApiService.getSourceDescendants(this.source.id, 'jobs', this.jobsDatatableService.getJobsDatatableOptions())
            .then(data => {
                this.jobsData = data.results as Job[];
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
    onJobsDatatableChange() {
        this.getSourceJobs();
    }
    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.sourcesApiService.getSource(id).then(data => {
                this.source = data as Source;
                this.metadataKeys = _.keys(this.source.meta_data);
                this.getSourceJobs();
            });
        }
    }
}
