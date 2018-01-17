import { Injectable } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class ChartService {
    constructor() {
    }

    private randomColorGenerator() {
        return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
    }

    formatPlotResults(data: any, params: any, filtersApplied: any, title: string, colors?: any[]): any {
        colors = colors || [];
        let valueArr = [],
            colArr = [],
            queryFilter = null,
            queryDates = [];

        const datasets = [];
        const dataLabels = [];

        const numDays = moment.utc(params.ended, 'YYYY-MM-DD').diff(moment.utc(params.started, 'YYYY-MM-DD'), 'd');
        for (let i = 0; i < numDays; i++) {
            dataLabels.push(moment.utc(params.started, 'YYYY-MM-DD').add(i, 'd').format('YYYY-MM-DD'));
        }

        if (filtersApplied.length > 0) {
            // filters were applied, so build data source accordingly
            _.forEach(data.results, (result, idx) => {
                valueArr = [];
                colArr = [];
                if (result.values.length > 0) {
                    // values for all filters are returned in one array of arrays,
                    // so group results by id to isolate filter values
                    const groupedResult = _.groupBy(result.values, 'id'),
                        resultObj = {},
                        filterIds = _.map(filtersApplied, 'id');
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
                            filtersApplied[0] :
                            _.find(filtersApplied, { id: parseInt(d[0], 10) });
                        queryDates = d[1];

                        // add result values to valueArr
                        _.forEach(dataLabels, (xDate) => {
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

                // populate chart dataset
                _.forEach(filtersApplied, (filter) => {
                    const filterData = _.find(colArr, { id: filter.id });
                    const label = filter.version ?
                        `${filter.title} ${filter.version} ${result.column.title}` :
                        `${filter.title} ${result.column.title}`;
                    datasets.push({
                        yAxisID: `yAxis${idx + 1}`,
                        stack: `stack${idx.toString()}`,
                        label: label,
                        icon: String.fromCharCode(parseInt(filter.icon_code, 16)),
                        backgroundColor: colors.length > 0 ? colors[idx % 2 === 0 ? 0 : 1] : this.randomColorGenerator(),
                        borderWidth: 2,
                        data: filterData ? filterData.data : []
                    });
                });
            });
        } else {
            // no filters were applied, so show aggregate statistics for selected metric
            _.forEach(data.results, (result, idx) => {
                valueArr = [];
                // add result values to valueArr
                _.forEach(dataLabels, (xDate) => {
                    const valueObj = _.find(result.values, (qDate) => {
                        return moment.utc(qDate.date, 'YYYY-MM-DD').isSame(moment.utc(xDate, 'YYYY-MM-DD'), 'day');
                    });
                    // push 0 if data for xDate is not present in result.values
                    valueArr.push(valueObj ? valueObj.value : 0);
                });

                // populate chart dataset
                datasets.push({
                    yAxisID: `yAxis${idx + 1}`,
                    stack: idx.toString(),
                    label: result.column.title + ' for all ' + title,
                    icon: null,
                    backgroundColor: colors.length > 0 ? colors[idx % 2 === 0 ? 0 : 1] : this.randomColorGenerator(),
                    data: valueArr
                });
            });
        }
        return {
            data: datasets,
            labels: dataLabels
        };
    }
}
