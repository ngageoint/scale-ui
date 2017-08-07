const _ = require('lodash');
const jobs = require('../data/jobs.json');

module.exports = function (request, reply) {
    var data = _.clone(jobs);
    var params = request.url.query;
    if (_.keys(params).length > 0) {
        if (params.job_type_name) {
            data.results = _.filter(data.results, function (r) {
                return r.job_type.name.toLowerCase().includes(params.job_type_name);
            });
        }
        if (params.order) {
            if (_.startsWith(params.order, '-')) {
                data.results = _.orderBy(data.results, [_.trimStart(params.order, '-')], ['desc']);
            } else {
                data.results = _.orderBy(data.results, [params.order], ['asc']);
            }
        }
        data.count = data.results.length;
        if (params.page && params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    reply(data);
};
