module.exports = function (request) {
    return require('../data/recipe-type-details/recipe-type-details-' + request.params.name + '-' + request.params.revision_num + '.json');
};
