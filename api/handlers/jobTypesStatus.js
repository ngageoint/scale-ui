const _ = require('lodash');
const jobTypes = require('../data/job-type-status.json');

module.exports = function (request) {
    var data = _.clone(jobTypes);
    var params = request.query;
    if (_.keys(params).length > 0) {
        if (params.order) {
            if (_.startsWith(params.order, '-')) {
                data.results = _.orderBy(data.results, [_.trimStart(params.order, '-')], ['desc']);
            } else {
                data.results = _.orderBy(data.results, [params.order], ['asc']);
            }
        }
        if (typeof params.is_active !== 'undefined') {
            data.results = _.filter(data.results, result => {
                return result.job_type.is_active === true;
            });
        }
        data.count = data.results.length;
        if (params.page && params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    return data;
};
