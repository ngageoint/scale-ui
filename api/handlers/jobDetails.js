module.exports = function (request, reply) {
    var jobDetails = require('../data/job-details/job-details' + request.params.id + '.json');
    reply(jobDetails);
};
