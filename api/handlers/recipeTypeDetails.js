module.exports = function (request, reply) {
    const recipeTypeDetails = require('../data/recipe-type-details/recipe-type-details' + request.params.id + '.json');
    reply(recipeTypeDetails);
};
