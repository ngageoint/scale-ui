const _ = require('lodash');
const errorTypes = require('../data/metricsErrorTypes.json');
const ingest = require('../data/metricsIngest.json');
const jobTypes = require('../data/metricsJobTypes.json');

module.exports = function (request) {
    var dataType = request.url.href.split('/')[4];
    var data = dataType === 'job-types' ? _.clone(jobTypes) : dataType === 'ingest' ? _.clone(ingest) : _.clone(errorTypes);
    return data;
};
