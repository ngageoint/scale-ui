var _ = require('lodash');
var jobTypes = require('../data/job-types.json');

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
            var isActive = params.is_active === 'true';
            data.results = _.filter(data.results, function (result) {
                return result.is_active === isActive;
            });
        }
        if (typeof params.keyword !== 'undefined') {
            data.results = _.filter(data.results, function (result) {
                return _.includes(result.title, params.keyword);
            });
        }
        data.count = data.results.length;
        if (params.page && params.page_size && params.page !== 'null' && params.page_size !== 'null') {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults.length > 0 ? pagedResults[params.page - 1] : pagedResults;
        }
    }

    return data;
};
