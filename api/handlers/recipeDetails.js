module.exports = function (request, reply) {
    const recipeDetails = require('../data/recipe-details/recipe-details' + request.params.id + '.json');
    reply(recipeDetails);
};
