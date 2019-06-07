module.exports = function (request) {
    return require('../data/silo-manifest-details/silo-manifest' + request.params.id + '.json');
};
