import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';
import * as moment from 'moment';

import { JobTypesApiService } from '../../configuration/job-types/api.service';
import { JobTypeHistoryDatatableService } from './datatable.service';
import { JobTypeHistoryDatatable } from './datatable.model';
import { MetricsApiService } from '../../data/metrics/api.service';

@Component({
    selector: 'dev-job-type-history',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})

export class JobTypeHistoryComponent implements OnInit {
    datatableOptions: JobTypeHistoryDatatable;
    columns: any[];
    jobTypes: any;
    jobTypeOptions: SelectItem[];
    selectedJobType: any;
    performanceData: any[];
    sortConfig: any;
    datatableLoading: boolean;

    constructor(
        private jobTypeHistoryDatatableService: JobTypeHistoryDatatableService,
        private jobTypesApiService: JobTypesApiService,
        private metricsApiService: MetricsApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.selectedJobType = null;
        this.datatableOptions = this.jobTypeHistoryDatatableService.getJobTypeHistoryDatatableOptions();
        this.columns = [
            { field: 'job_type.id', header: 'Job Type' },
            { field: 'twentyfour_hours', header: '24 Hours' },
            { field: 'fortyeight_hours', header: '48 Hours' },
            { field: 'thirty_days', header: '30 Days' }
        ];
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
        let choiceIds = null;
        if (this.selectedJobType) {
            choiceIds = Array.isArray(this.selectedJobType) ?
                _.map(this.selectedJobType, 'id') :
                [this.selectedJobType.id];
        } else {
            choiceIds = _.map(this.jobTypes, 'id');
        }
        const metricsParams = {
            page: 1,
            page_size: null,
            started: moment.utc().subtract(30, 'd').startOf('d').toISOString(),
            ended: moment.utc().add(1, 'd').startOf('d').toISOString(),
            choice_id: choiceIds,
            column: ['error_system_count', 'error_algorithm_count', 'error_data_count', 'total_count'],
            group: null,
            dataType: 'job-types'
        };
        this.metricsApiService.getPlotData(metricsParams).subscribe(metricsData => {
            if (metricsData.results.length > 0) {
                const data30Days = _.map(metricsData.results, 'values'),
                    data48Hours = this.formatData(data30Days, 2),
                    data24Hours = this.formatData(data48Hours, 1);

                let tempData = [];

                _.forEach(this.jobTypes, (jobType) => {
                    tempData.push({
                        job_type: jobType,
                        twentyfour_hours: this.formatColumn(data24Hours, jobType.id),
                        fortyeight_hours: this.formatColumn(data48Hours, jobType.id),
                        thirty_days: this.formatColumn(data30Days, jobType.id)
                    });
                });
                if (this.datatableOptions.name && this.datatableOptions.version) {
                    tempData = _.filter(tempData, (d) => {
                        if (Array.isArray(this.datatableOptions.name)) {
                            // more than one job type selected, so both name and version are arrays
                            return _.indexOf(this.datatableOptions.name, d.job_type.name) >= 0 &&
                                   _.indexOf(this.datatableOptions.version, d.job_type.version) >= 0;
                        }
                        // name and version are just strings
                        return d.job_type.name === this.datatableOptions.name && d.job_type.version === this.datatableOptions.version;
                    });
                }
                const direction = this.datatableOptions.sortOrder === -1 ? 'desc' : 'asc';
                this.performanceData = _.orderBy(tempData, [this.datatableOptions.sortField], [direction]);
                this.datatableLoading = false;
            }
        }, err => {
            this.datatableLoading = false;
            console.log(err);
        });
    }
    private updateOptions(skipUpdate?) {
        this.jobTypeHistoryDatatableService.setJobTypeHistoryDatatableOptions(this.datatableOptions);

        // update querystring
        this.router.navigate(['/processing/job-type-history'], {
            queryParams: this.datatableOptions,
            replaceUrl: true
        });

        if (!skipUpdate) {
            this.updateData();
        }
    }
    private getJobTypes() {
        const selectedJobTypes = [];
        this.datatableLoading = true;
        this.metricsApiService.getDataTypeOptions('job-types').subscribe(data => {
            this.datatableLoading = false;
            this.jobTypes = data.choices;
            const selectItems = [];
            _.forEach(this.jobTypes, jobType => {
                selectItems.push({
                    label: `${jobType.title} ${jobType.version}`,
                    value: jobType
                });
                if (Array.isArray(this.datatableOptions.name)) {
                    // more than one job type selected, so both name and version are arrays
                    if (
                        _.indexOf(this.datatableOptions.name, jobType.name) >= 0 &&
                        _.indexOf(this.datatableOptions.version, jobType.version) >= 0
                    ) {
                        selectedJobTypes.push(jobType);
                    }
                } else {
                    // name and version are just strings
                    if (
                        this.datatableOptions.name === jobType.name &&
                        this.datatableOptions.version === jobType.version
                    ) {
                        selectedJobTypes.push(jobType);
                    }
                }
            });
            if (selectedJobTypes.length > 0) {
                this.selectedJobType = selectedJobTypes;
            }
            this.jobTypeOptions = _.orderBy(selectItems, ['label'], ['asc']);
            this.updateOptions();
        });
    }

    getColor(data) {
        return data.total > 0 ? parseFloat((data.errorTotal / data.total).toFixed(2)) >= 0.5 ? '#fff' : '#000' : '#000';
    }
    getBackground(data, type) {
        const rgb = type === 'system' ? '103, 0, 13' : type === 'algorithm' ? '203, 24, 29' : '241, 105, 19';
        return data.total > 0 ?
            'rgba(' + rgb + ', ' + parseFloat((data.errorTotal / data.total).toFixed(2)) + ')' :
            'rgba(' + rgb + ', ' + ' 0)';
    }
    getUnicode(code) {
        return `&#x${code};`;
    }
    sortBy(field) {
        let sortField = this.datatableOptions.sortField.split('.');
        this.sortConfig[sortField[0]][sortField[1]].icon = 'hidden';
        sortField = field.split('.');
        this.sortConfig[sortField[0]][sortField[1]].direction = this.sortConfig[sortField[0]][sortField[1]].direction === 'desc' ?
            'asc' :
            'desc';
        this.sortConfig[sortField[0]][sortField[1]].icon = this.sortConfig[sortField[0]][sortField[1]].direction === 'desc' ?
            'fa-caret-down' :
            'fa-caret-up';
        this.performanceData = _.orderBy(this.performanceData, [field], [this.sortConfig[sortField[0]][sortField[1]].direction]);
        this.datatableOptions = Object.assign(this.datatableOptions, {
            sortField: field,
            sortOrder: this.sortConfig[sortField[0]][sortField[1]].direction === 'desc' ? -1 : 1
        });
        this.updateOptions(true);
    }
    onChange(e) {
        const name = _.map(e.value, 'name');
        const version = _.map(e.value, 'version');
        this.datatableOptions.name = name.length > 0 ? name : null;
        this.datatableOptions.version = version.length > 0 ? version : null;
        this.updateOptions();
    }
    onRowSelect(e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey || e.originalEvent.which === 2) {
            window.open(this.getJobsHistoryURL(e.data.job_type));
        } else {
            this.router.navigate([this.getJobsHistoryURL(e.data.job_type)]);
        }
    }
    getJobsHistoryURL(jobType: any): string {
        return `/processing/job-type-history/${jobType.name}`;
    }
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.datatableOptions = {
                    sortField: params.sortField || 'twentyfour_hours.failRate',
                    sortOrder: +params.sortOrder || -1,
                    name: params.name || null,
                    version: params.version || null,
                    category: params.category || null
                };
            } else {
                this.datatableOptions = this.jobTypeHistoryDatatableService.getJobTypeHistoryDatatableOptions();
            }
        });
        this.sortConfig = {
            twentyfour_hours: {
                system: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                algorithm: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                data: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                total: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                failRate: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' }
            },
            fortyeight_hours: {
                system: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                algorithm: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                data: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                total: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                failRate: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' }
            },
            thirty_days: {
                system: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                algorithm: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                data: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                total: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' },
                failRate: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' }
            },
            job_type: {
                title: { direction: this.datatableOptions.sortOrder || 'desc', icon: 'hidden' }
            }
        };
        const sortField = this.datatableOptions.sortField.split('.');
        this.sortConfig[sortField[0]][sortField[1]].direction = this.datatableOptions.sortOrder === -1 ? 'desc' : 'asc';
        this.sortConfig[sortField[0]][sortField[1]].icon = this.sortConfig[sortField[0]][sortField[1]].direction === 'desc' ?
            'fa-caret-down' :
            'fa-caret-up';
        this.getJobTypes();
    }
}
