const _ = require('lodash');
const errorTypes = require('../data/metricsErrorTypes.json');
const ingest = require('../data/metricsIngest.json');
const jobTypes = require('../data/metricsJobTypes.json');
const recipesTimeline = require('../data/metricsRecipes.json');

module.exports = function (request) {
    var dataType = request.url.href.split('/');
    dataType = dataType[dataType.length - 2];
    console.log(dataType);
    var data = dataType === 'job-types' ? _.clone(jobTypes) : dataType === 'ingest' ? _.clone(ingest) : dataType === 'recipes' ? _.clone(recipesTimeline) : _.clone(errorTypes);
    return data;
};
