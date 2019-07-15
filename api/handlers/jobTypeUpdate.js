module.exports = function (request) {
    const jobTypeDetails = require('../data/job-type-details/' + request.params.name + request.params.version + '.json');
    jobTypeDetails.is_paused = request.payload.is_paused;
    jobTypeDetails.is_active = request.payload.is_active;
    return jobTypeDetails;
};
