module.exports = function (request) {
    return require('../data/job-type-details/' + request.params.name + request.params.version + '.json');
};
