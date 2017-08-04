const _ = require('lodash');
const recipes = require('../data/recipes.json');

module.exports = function (request, reply) {
    console.log(request.url.query);

    reply(recipes);
}
