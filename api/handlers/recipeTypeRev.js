const _ = require('lodash');
const recipeTypeRevs = require('../data/recipe-types-rev.json');

module.exports = function (request) {
    const results = {};
    results['count'] = 0;
    results['next'] = null;
    results['previous'] = null;
    results['results'] = [];
    results.results = _.filter(recipeTypeRevs, recipe => {
        return recipe.recipe_type.name === request.params.name;
    });
    results.count = results.results.length;
    return results;
};
