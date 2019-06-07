module.exports = function (request) {
    return require('../data/silo-job-details/silo-job' + request.params.id + '.json');
};
