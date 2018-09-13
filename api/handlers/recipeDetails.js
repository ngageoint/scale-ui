module.exports = function (request) {
    return require('../data/recipe-details/recipe-details' + request.params.id + '.json');
};
