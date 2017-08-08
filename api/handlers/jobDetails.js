module.exports = function (request, reply) {
    const jobDetails = require('../data/job-details/job-details' + request.params.id + '.json');
    reply(jobDetails);
};
