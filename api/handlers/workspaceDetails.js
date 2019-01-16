module.exports = function (request) {
    return require('../data/workspace-details/workspace-' + request.params.id + '.json');
};
