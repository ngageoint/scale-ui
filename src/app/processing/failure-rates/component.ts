import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';
import * as moment from 'moment';

import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { JobType } from '../../configuration/job-types/api.model';
import { FailureRatesDatatableService } from './datatable.service';
import { JobTypesDatatable } from '../../configuration/job-types/datatable.model';
import { MetricsApiService } from '../../data/metrics/api.service';

@Component({
    selector: 'app-failure-rates',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class FailureRatesComponent implements OnInit {
    datatableOptions: JobTypesDatatable;
    allJobTypes: JobType[];
    jobTypes: JobType[];
    jobTypeOptions: SelectItem[];
    selectedJobType: number;
    performanceData: any[];
    first: number;
    count: number;
    isInitialized: boolean;

    constructor(
        private failureRatesDatatableService: FailureRatesDatatableService,
        private jobTypesApiService: JobTypesApiService,
        private metricsApiService: MetricsApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.isInitialized = false;
        this.performanceData = [];
    }

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
    };
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
            errorTotal: null
        };
        obj.errorTotal = obj.system + obj.algorithm + obj.data;

        return obj;
    };
    private updateData() {
        this.jobTypesApiService.getJobTypes(this.datatableOptions).then(data => {
            this.count = data.count;
            this.allJobTypes = data.results as JobType[];
            this.jobTypes = data.results as JobType[];
            const selectItems = [];
            _.forEach(this.allJobTypes, (jobType) => {
                selectItems.push({
                    label: jobType.title + ' ' + jobType.version,
                    value: jobType.id
                });
            });
            this.jobTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
            this.jobTypeOptions.unshift({
                label: 'All',
                value: 0
            });

            const metricsParams = {
                page: null,
                page_size: null,
                started: this.datatableOptions.started,
                ended: this.datatableOptions.ended,
                choice_id: this.selectedJobType > 0 ? [this.selectedJobType] : _.map(this.jobTypes, 'id'),
                column: ['error_system_count', 'error_algorithm_count', 'error_data_count', 'total_count'],
                group: null,
                dataType: 'job-types'
            };

            this.metricsApiService.getPlotData(metricsParams).then(metricsData => {
                if (metricsData.results.length > 0) {
                    const data30Days = _.map(metricsData.results, 'values'),
                        data48Hours = this.formatData(data30Days, 2),
                        data24Hours = this.formatData(data48Hours, 1);

                    _.forEach(this.jobTypes, (jobType) => {
                        this.performanceData.push({
                            job_type: jobType,
                            twentyfour_hours: this.formatColumn(data24Hours, jobType.id),
                            fortyeight_hours: this.formatColumn(data48Hours, jobType.id),
                            thirty_days: this.formatColumn(data30Days, jobType.id)
                        });
                    });

                    this.performanceData = _.orderBy(this.performanceData, [(d) => {
                        if (d.twentyfour_hours.total > 0) {
                            return d.twentyfour_hours.errorTotal / d.twentyfour_hours.total;
                        }
                        return 0;
                    }, 'twentyfour_hours.total'], ['desc', 'desc']);
                    console.log(this.performanceData);

                    // vm.gridOptions.data = vm.performanceData;
                    // if (!skipSort) {
                    //     vm.currSortField = vm.jobTypesParams.orderField || 'twentyfour_hours';
                    //     vm.currSortErrorType = vm.jobTypesParams.orderErrorType || 'errorTotal';
                    //     if (vm.jobTypesParams.order && vm.jobTypesParams.orderField && vm.jobTypesParams.orderErrorType) {
                    //         vm.sortBy(vm.jobTypesParams.orderErrorType, vm.jobTypesParams.orderField, vm.jobTypesParams.order);
                    //     }
                    // }
                }
            }).catch((error) => {
                console.log(error);
            });
        });
    }
    private updateOptions() {
        this.failureRatesDatatableService.setFailureRatesDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/failure-rates'], {
            queryParams: this.datatableOptions
        });

        this.updateData();
    }

    onChange() {
        if (this.selectedJobType > 0) {
            this.jobTypes = _.filter(this.allJobTypes, (jobType) => {
                return jobType.id === this.selectedJobType;
            });
        } else {
            this.jobTypes = _.orderBy(_.clone(this.allJobTypes),
                [this.datatableOptions.sortField],
                [this.datatableOptions.sortOrder > 0 ? 'asc' : 'desc']);
        }
    }
    onLazyLoad(e: LazyLoadEvent) {
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
    ngOnInit() {
        if (this.route.snapshot &&
            Object.keys(this.route.snapshot.queryParams).length > 0) {

            const params = this.route.snapshot.queryParams;
            this.datatableOptions = {
                first: parseInt(params.first, 10),
                rows: null,
                sortField: params.sortField,
                sortOrder: parseInt(params.sortOrder, 10),
                id: params.id,
                started: params.started,
                ended: params.ended,
                name: params.name,
                category: params.category,
                is_active: params.is_active,
                is_operational: params.is_operational
            };
        } else {
            this.datatableOptions = this.failureRatesDatatableService.getFailureRatesDatatableOptions();
        }
        this.updateOptions();
    }
}
