import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';

import { JobTypesApiService } from './api.service';
import { JobType } from './api.model';

@Component({
    selector: 'app-job-types',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobTypesComponent implements OnInit {
    jobTypes: SelectItem[];
    selectedJobType: SelectItem;
    selectedJobTypeDetail: any;

    constructor(
        private jobTypesApiService: JobTypesApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    private getJobTypeDetail(id: number) {
        this.jobTypesApiService.getJobType(id).then(data => {
            this.selectedJobTypeDetail = JobType.transformer(data);
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }
    onRowSelect(e) {
        this.router.navigate(['/configuration/job-types'], {
            queryParams: {
                id: e.value.id,
            },
            replaceUrl: true
        });
        this.getJobTypeDetail(e.value.id);
    }
    ngOnInit() {
        this.jobTypes = [];
        const params = this.route.snapshot ? this.route.snapshot.queryParams : { id: null };
        this.jobTypesApiService.getJobTypes().then(data => {
            _.forEach(data.results, (result) => {
                this.jobTypes.push({
                    label: result.title + ' ' + result.version,
                    value: result
                });
                if (params.id && parseInt(params.id, 10) === result.id) {
                    this.selectedJobType = _.clone(result);
                }
            });
            if (params.id) {
                this.getJobTypeDetail(params.id);
            }
        });
    }
}
