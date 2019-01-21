module.exports = function (request) {
    return require('../data/scan-details/scan-' + request.params.id + '.json');
};
