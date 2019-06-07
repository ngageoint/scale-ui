module.exports = function (request) {
    return require('../data/silo-image-details/silo-image' + request.params.id + '.json');
};
