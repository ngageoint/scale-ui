const _ = require('lodash');
const runningJobs = require('../data/running-jobs.json');

module.exports = function (request, reply) {
    var data = _.clone(runningJobs);
    var params = request.url.query;
    if (_.keys(params).length > 0) {
        data.count = data.results.length;
        if (params.page && params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    reply(data);
};
