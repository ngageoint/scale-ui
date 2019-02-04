import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';

import { JobsApiService } from '../jobs/api.service';
import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { JobType } from '../../configuration/job-types/api.model';

@Component({
    selector: 'dev-job-type-history-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class JobTypeHistoryDetailsComponent implements OnInit {
    datatableLoading: boolean;
    jobs: any;
    jobType: JobType;

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private jobsApiService: JobsApiService,
        private jobTypesApiService: JobTypesApiService
    ) {}

    private formatData(data, numDays) {
        const dataArr = [];
        _.forEach(data, function (result) {
            const filteredResult = _.filter(result, (d) => {
                const date = moment.utc(d.date, 'YYYY-MM-DD');
                if (moment.utc().diff(moment.utc(date), 'd') <= numDays) {
                    return d;
                }
            });
            dataArr.push(filteredResult);
        });
        return dataArr;
    }

    private formatColumn(cData, id) {
        const systemErrors = cData[0],
            algorithmErrors = cData[1],
            dataErrors = cData[2],
            totalCount = cData[3];

        const obj = {
            system: _.sum(_.map(_.filter(systemErrors, { id: id }), 'value')),
            algorithm: _.sum(_.map(_.filter(algorithmErrors, { id: id }), 'value')),
            data: _.sum(_.map(_.filter(dataErrors, { id: id }), 'value')),
            total: _.sum(_.map(_.filter(totalCount, { id: id }), 'value')),
            errorTotal: null,
            failRate: null,
            failRatePercent: null
        };
        obj.errorTotal = obj.system + obj.algorithm + obj.data;
        obj.failRate = obj.total > 0 ? obj.errorTotal / obj.total : 0;
        obj.failRatePercent = (obj.failRate * 100).toFixed(0) + '%';

        return obj;
    }

    private updateData() {
        this.datatableLoading = true;
        const params = {
            page: 1,
            page_size: 20,
            job_type_id: this.jobType.id,
            started: moment.utc().subtract(30, 'd').startOf('d').toISOString(),
            ended: moment.utc().add(1, 'd').startOf('d').toISOString(),
            status: ['FAILED', 'COMPLETED', 'CANCELED'],
            order: '-last_modified'
        };
        this.jobsApiService.getJobs(params).subscribe(data => {
            this.jobs = data.results;
            // if (data.results.length > 0) {
            //     const data30Days = _.map(data.results, 'values'),
            //         data48Hours = this.formatData(data30Days, 2),
            //         data24Hours = this.formatData(data48Hours, 1);
            //
            //     let tempData = [];
            //
            //     _.forEach(this.jobs, job => {
            //         tempData.push({
            //             job: job,
            //             twentyfour_hours: this.formatColumn(data24Hours, jobType.id),
            //             fortyeight_hours: this.formatColumn(data48Hours, jobType.id),
            //             thirty_days: this.formatColumn(data30Days, jobType.id)
            //         });
            //     });
            //     if (this.datatableOptions.name && this.datatableOptions.version) {
            //         tempData = _.filter(tempData, (d) => {
            //             return d.job_type.name === this.datatableOptions.name && d.job_type.version === this.datatableOptions.version;
            //         });
            //     }
            //     const direction = this.datatableOptions.sortOrder === -1 ? 'desc' : 'asc';
            //     this.performanceData = _.orderBy(tempData, [this.datatableOptions.sortField], [direction]);
            //     this.datatableLoading = false;
            // }
        }, err => {
            this.datatableLoading = false;
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving jobs', detail: err.statusText, life: 10000});
        });
    }

    private getJobType(name: string, version: string) {
        this.jobTypesApiService.getJobType(name, version).subscribe(data => {
            this.jobType = data;
            this.updateData();
        }, err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'Error retrieving job type details', detail: err.statusText, life: 10000});
        });
    }

    ngOnInit() {
        if (this.route.snapshot) {
            const name = this.route.snapshot.paramMap.get('name');
            const version = this.route.snapshot.paramMap.get('version');
            this.getJobType(name, version);
        }
    }
}
