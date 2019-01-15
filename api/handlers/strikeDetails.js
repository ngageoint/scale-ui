module.exports = function (request) {
    return require('../data/strike-details/strike-' + request.params.id + '.json');
};
