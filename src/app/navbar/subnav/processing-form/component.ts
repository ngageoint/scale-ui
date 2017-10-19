import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';

import { JobTypesApiService } from '../../../configuration/job-types/api.service';
import { JobType } from '../../../configuration/job-types/api.model';
import { SelectItem } from 'primeng/primeng';

@Component({
    selector: 'app-processing-form',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class ProcessingFormComponent implements OnInit {
    started: string;
    ended: string;
    jobTypes: any;
    jobTypeOptions: SelectItem[];
    selectedJobType: JobType;
    sourceFile: string;
    timeFieldOptions: SelectItem[];
    timeField: SelectItem;
    constructor(
        private jobTypesApiService: JobTypesApiService
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
        this.timeField = this.timeFieldOptions[0];
    }

    private getJobTypes() {
        this.jobTypesApiService.getJobTypes().then(data => {
            this.jobTypes = JobType.transformer(data.results);
            const selectItems = [];
            _.forEach(this.jobTypes, jobType => {
                selectItems.push({
                    label: jobType.title + ' ' + jobType.version,
                    value: jobType.id
                });
            });
            this.jobTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
        });
    }

    search() {
        console.log('search');
    }

    ngOnInit() {
        this.started = moment.utc().subtract(1, 'd').startOf('d').format('YYYY-MM-DD');
        this.ended = moment.utc().startOf('d').format('YYYY-MM-DD');
        this.getJobTypes();
    }

}
