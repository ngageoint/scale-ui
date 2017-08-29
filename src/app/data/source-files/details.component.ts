import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { SourceFile } from './api.model';
import { SourceFilesApiService } from './api.service';
import { DataService } from '../../data.service';

@Component({
    selector: 'app-source-file-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class SourceFileDetailsComponent implements OnInit {
    sourceFile: SourceFile;
    metadataKeys: string[];
    constructor(
        private route: ActivatedRoute,
        private sourceFilesApiService: SourceFilesApiService,
        private dataService: DataService
    ) {}

    formatFilesize(filesize) {
        return this.dataService.calculateFileSizeFromBytes(filesize, 0);
    }
    formatDate(date) {
        return this.dataService.formatDate(date);
    }
    showMetadata() {
        console.log('show metadata');
    }
    ngOnInit() {
        if (this.route.snapshot) {
            const id = parseInt(this.route.snapshot.paramMap.get('id'), 10);
            this.sourceFilesApiService.getSourceFile(id).then(data => {
                this.sourceFile = data as SourceFile;
                this.metadataKeys = _.keys(this.sourceFile.meta_data);
            });
        }
    }
}
