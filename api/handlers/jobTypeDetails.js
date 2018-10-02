module.exports = function (request) {
    return require('../data/job-type-details/job-type-details' + request.params.id + '.json');
};
