import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';
import * as moment from 'moment';

import { JobTypesApiService } from '../../../configuration/job-types/api.service';
import { JobType } from '../../../configuration/job-types/api.model';
import { JobsDatatableService } from '../../../processing/jobs/datatable.service';
import { SourcesDatatableService } from '../../../data/sources/datatable.service';

@Component({
    selector: 'app-processing-form',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class ProcessingFormComponent implements OnInit {
    @Output() onSearch = new EventEmitter();
    started: string;
    ended: string;
    jobTypes: any;
    jobTypeOptions: SelectItem[];
    selectedJobType: number;
    sourceFile: string;
    timeFieldOptions: SelectItem[];
    timeField: string;
    constructor(
        private router: Router,
        private jobTypesApiService: JobTypesApiService,
        private jobsDatatableService: JobsDatatableService,
        private sourcesDatatableService: SourcesDatatableService
    ) {
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
        this.timeField = this.timeFieldOptions[0].value;
    }

    private getJobTypes() {
        this.jobTypesApiService.getJobTypes().subscribe(data => {
            this.jobTypes = JobType.transformer(data.results);
            const selectItems = [];
            _.forEach(this.jobTypes, jobType => {
                selectItems.push({
                    label: `${jobType.manifest.job.title} ${jobType.manifest.job.jobVersion}`,
                    value: jobType.id
                });
            });
            this.jobTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
        });
    }

    search() {
        if (this.selectedJobType) {
            Object.assign(this.jobsDatatableService.getJobsDatatableOptions(), {
                job_type_id: this.selectedJobType
            });
            this.router.navigate(['/processing/jobs']);
        } else if (this.sourceFile) {
            Object.assign(this.sourcesDatatableService.getSourcesDatatableOptions(), {
                file_name: this.sourceFile,
                time_field: this.timeField
            });
            this.router.navigate(['/data/sources']);
        }
        this.onSearch.emit();
    }

    ngOnInit() {
        this.started = moment.utc().subtract(1, 'd').startOf('d').format('YYYY-MM-DD');
        this.ended = moment.utc().startOf('d').format('YYYY-MM-DD');
        this.getJobTypes();
    }

}
