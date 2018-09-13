module.exports = function (request) {
    const jobTypeDetails = require('../data/job-type-details/job-type-details' + request.params.id + '.json');
    jobTypeDetails.is_paused = request.payload.is_paused;
    return jobTypeDetails;
};
