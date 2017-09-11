import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import * as _ from 'lodash';
import * as moment from 'moment';

import { MetricsApiService } from './api.service';

@Component({
    selector: 'app-metrics',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class MetricsComponent implements OnInit {
    started = moment.utc().subtract(1, 'M').startOf('d').format('YYYY-MM-DD');
    ended = moment.utc().startOf('d').format('YYYY-MM-DD');
    availableDataTypes: SelectItem[] = [];
    selectedDataType: any;
    filtersApplied: any[] = [];
    selectedDataTypeOptions: any[] = [];
    dataTypeFilterText = '';
    filteredChoices: any[] = [];
    filteredChoicesOptions: any[] = [];
    columns: any[] = [];
    metricOptions: SelectItem[] = [];
    selectedMetric: any;
    data: any;
    constructor(
        private metricsApiService: MetricsApiService
    ) {
        this.getDataTypes();
    }

    getDataTypes() {
        this.metricsApiService.getDataTypes().then((data) => {
            _.forEach(data.results, (result) => {
                this.availableDataTypes.push({
                    label: result.title,
                    value: result
                });
            });
        });
    }
    getDataTypeOptions() {
        this.metricsApiService.getDataTypeOptions(this.selectedDataType.name).then((result) => {
            console.log(result);
            this.selectedDataTypeOptions = result;
            _.forEach(result.filters, (filter) => {
                this.dataTypeFilterText = this.dataTypeFilterText.length === 0 ?
                    _.capitalize(filter.param) :
                    this.dataTypeFilterText + ', ' + _.capitalize(filter.param);
            });
            this.filteredChoices = _.orderBy(result.choices, ['title', 'version'], ['asc', 'asc']);
            // format filteredChoices for use with multiselect directive
            const filteredChoicesOptions = [];
            _.forEach(this.filteredChoices, (choice) => {
                filteredChoicesOptions.push({
                    label: choice.version ? choice.title + ' ' + choice.version : choice.title,
                    value: choice
                });
            });
            this.filteredChoicesOptions = filteredChoicesOptions;
            this.columns = _.orderBy(result.columns, ['group', 'title'], ['asc', 'asc']);
            _.forEach(this.columns, (column) => {
                const option = {
                    label: column.title,
                    value: column
                };
                this.metricOptions.push(option);
            });
        });
    }
    onStartSelect(e) {
        this.started = e;
    }
    onEndSelect(e) {
        this.ended = e;
    }
    changeDataTypeSelection() {
        // reset options
        this.filtersApplied = [];
        this.selectedDataTypeOptions = [];
        this.dataTypeFilterText = '';
        this.selectedMetric = null;
        this.columns = [];

        if (!this.selectedDataType.name || this.selectedDataType.name === '') {
            this.selectedDataType = {};
            this.getDataTypes();
        } else {
            this.getDataTypeOptions();
        }
    }
    updateChart() {
        this.data = {
            labels: [],
            datasets: []
        };
        const numDays = moment.utc(this.ended, 'YYYY-MM-DD').diff(moment.utc(this.started, 'YYYY-MM-DD'), 'd');
        for (let i = 0; i < numDays; i++) {
            this.data.labels.push(moment.utc(this.started, 'YYYY-MM-DD').add(i, 'd').format('YYYY-MM-DD'));
        }
        const params = {
            page: null,
            page_size: null,
            started: this.started,
            ended: this.ended,
            choice_id: _.map(this.filtersApplied, 'id'),
            column: this.selectedMetric.name,
            group: this.selectedMetric.group,
            dataType: this.selectedDataType.name
        };
        this.metricsApiService.getPlotData(params).then((data) => {
            let valueArr = [],
                queryFilter = null,
                queryDates = [];

            const colNames = [],
                colArr = [];

            if (this.filtersApplied.length > 0) {
                // filters were applied, so build data source accordingly
                _.forEach(data.results, (result) => {
                    if (result.values.length > 0) {
                        // values for all filters are returned in one array of arrays,
                        // so group results by id to isolate filter values
                        const groupedResult = _.groupBy(result.values, 'id'),
                            resultObj = {},
                            filterIds = _.map(this.filtersApplied, 'id');
                        // try to get each filter id from groupedResult.
                        // if it's undefined, an empty array will be returned
                        // this allows a zeroed array to appear in the chart,
                        // since we want to include all filters selected by the user
                        // regardless of value
                        if (filterIds.length > 1) {
                            // when more than one filter is requested, then an id
                            // value is present within data.results
                            _.forEach(filterIds, (id) => {
                                resultObj[id] = _.get(groupedResult, id, []);
                            });
                        } else {
                            // when one filter is requested, no id value is included
                            // in data.results, so build resultObj with the other
                            // info we have
                            resultObj[params.choice_id[0]] = _.toPairs(groupedResult)[0][1];
                        }
                        _.forEach(_.toPairs(resultObj), (d) => {
                            valueArr = [];
                            // d[0] will be choice id, d[1] will be values
                            // if only one filter was selected, d[0] will return as string 'undefined' since no id is included in this case
                            queryFilter = d[0] === 'undefined' ?
                                this.filtersApplied[0] :
                                _.find(this.filtersApplied, { id: parseInt(d[0], 10) });
                            queryDates = d[1];

                            // add result values to valueArr
                            _.forEach(this.data.labels, (xDate) => {
                                const valueObj = _.find(queryDates, (qDate) => {
                                    return moment.utc(qDate.date, 'YYYY-MM-DD').isSame(moment.utc(xDate, 'YYYY-MM-DD'), 'day');
                                });
                                // push 0 if data for xDate is not present in queryDates
                                valueArr.push(valueObj ? valueObj.value : 0);
                            });

                            // prepend valueArr with filter title, and push onto colArr
                            colArr.push({
                                id: queryFilter.id,
                                data: valueArr
                            });
                        });
                    }
                });
            } else {
                // no filters were applied, so show aggregate statistics
                _.forEach(data.results, (result) => {
                    // add result values to valueArr
                    _.forEach(this.data.labels, (xDate) => {
                        const valueObj = _.find(result.values, (qDate) => {
                            return moment.utc(qDate.date, 'YYYY-MM-DD').isSame(moment.utc(xDate, 'YYYY-MM-DD'), 'day');
                        });
                        // push 0 if data for xDate is not present in result.values
                        valueArr.push(valueObj ? valueObj.value : 0);
                    });

                    // prepend valueArr with filter title, and push onto colArr
                    const columnLabel = result.column.title + ' for all ' + params.dataType.title;
                    valueArr.unshift(columnLabel);
                    colNames['aggregate'] = columnLabel;
                    colArr.push(valueArr);
                });
            }
            console.log(colArr);
            // _.forEach(this.filtersApplied, (filter) => {
            //     const resultData = [];
            //     _.forEach(data.results, (result) => {
            //         resultData.push(_.map(_.filter(result.values, { id: filter.id }), 'value'));
            //     });
            //     this.data.datasets.push({
            //         label: filter.title,
            //         data: resultData
            //     });
            // });
            // console.log(this.data);
        });
    }
    ngOnInit() {
    }
}
