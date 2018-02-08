const _ = require('lodash');
const moment = require('moment');

module.exports = function (request, reply) {
    var sourceDescendants = null;
    if (request.params.type === 'jobs') {
        sourceDescendants = require('../data/jobs.json');
    }
    var data = _.clone(sourceDescendants);
    var params = request.url.query;
    if (_.keys(params).length > 0) {
        if (params.started !== 'null' && params.ended !== 'null') {
            data.results = _.filter(data.results, function (r) {
                return moment.utc(params.started).isSameOrAfter(moment.utc(r.started)) && moment.utc(params.ended).isSameOrBefore(moment.utc(r.ended));
            });
        }
        if (params.job_type_id) {
            data.results = _.filter(data.results, function (r) {
                if (Array.isArray(params.job_type_id)) {
                    return _.includes(params.job_type_id, r.job_type.id.toString());
                }
                return r.job_type.id === parseInt(params.job_type_id);
            });
        }
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
