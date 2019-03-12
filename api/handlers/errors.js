const _ = require('lodash');
const moment = require('moment');
const jobTypes = require('../data/job-types');

module.exports = function (request) {
    var params = request.url.query;
    var data = {
        count: Math.floor(Math.random() * (100 - 10) + 10) + 1,
        next: null,
        previous: null,
        results: []
    };
    var categoryValues = ['SYSTEM', 'ALGORITHM', 'DATA'];
    var start = moment.utc().subtract(1, 'd');
    var stop = moment.utc();
    for (var i = 1; i <= data.count; i++) {
        var date = moment.utc(start.valueOf() + Math.random() * (stop.valueOf() - start.valueOf())).toISOString();
        var categoryValue = categoryValues[Math.floor(Math.random() * (categoryValues.length))];
        data.results.push({
            id: i,
            name: 'error' + i,
            title: 'Error ' + i,
            description: 'Unknown error',
            job_type_name: jobTypes.results[Math.floor(Math.random() * (jobTypes.results.length))].name,
            category: categoryValue,
            is_builtin: false,
            created: date,
            last_modified: moment.utc(date).add(5, 'm').toISOString()
        });
    }
    if (_.keys(params).length > 0) {
        if (params.order) {
            if (_.startsWith(params.order, '-')) {
                data.results = _.orderBy(data.results, [_.trimStart(params.order, '-')], ['desc']);
            } else {
                data.results = _.orderBy(data.results, [params.order], ['asc']);
            }
        }
        if (params.job_type_name) {
            data.results = _.filter(data.results, function (r) {
                if (Array.isArray(params.job_type_name)) {
                    return _.includes(params.job_type_name, r.job_type.name);
                }
                return r.job_type_name === params.job_type_name;
            });
        }
        data.count = data.results.length;
        if (params.page && params.page_size && data.count > params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    return data;
};
