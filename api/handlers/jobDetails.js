module.exports = function (request) {
    return require('../data/job-details/job-details' + request.params.id + '.json');
};
