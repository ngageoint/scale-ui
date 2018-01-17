const _ = require('lodash');
const moment = require('moment');
const jobs = require('../data/jobs.json');

module.exports = function (request, reply) {
    var data = _.clone(jobs);
    var params = request.url.query;
    if (_.keys(params).length > 0) {
        if (params.job_type_id) {
            data.results = _.filter(data.results, function (r) {
                if (Array.isArray(params.job_type_id)) {
                    return _.includes(params.job_type_id, r.job_type.id.toString());
                }
                return r.job_type.id === parseInt(params.job_type_id);
            });
        }
        if (params.order) {
            if (_.startsWith(params.order, '-')) {
                data.results = _.orderBy(data.results, [_.trimStart(params.order, '-')], ['desc']);
            } else {
                data.results = _.orderBy(data.results, [params.order], ['asc']);
            }
        }
        if (params.status) {
            data.results = _.filter(data.results, function (result) {
                return result.status === params.status;
            });
        }
        if (params.error_category) {
            data.results = _.filter(data.results, function (result) {
                return result.error_category === params.error_category;
            });
        }
        if (params.started && params.ended) {
            data.results = _.filter(data.results, function (result) {
                return moment.utc(result.started).isSameOrAfter(moment.utc(params.started)) && moment.utc(result.ended).isSameOrBefore(moment.utc(params.ended));
            });
        }
        data.count = data.results.length;
        if (params.page && params.page_size && data.count > params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    reply(data);
};
