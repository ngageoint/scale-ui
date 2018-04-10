module.exports = function (request, reply) {
    var jobTypeDetails = require('../data/job-type-details/job-type-details' + request.params.id + '.json');
    reply(jobTypeDetails);
};
