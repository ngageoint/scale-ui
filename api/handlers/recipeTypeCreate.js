const moment = require('moment');
const _ = require('lodash');

module.exports = function (request) {
    const jobTypeObjects = [];
    const jobTypes = [];
    const recipeTypeObjects = [];
    const subRecipeTypes = [];
    _.forEach(request.payload.definition.nodes, node => {
        if (node.node_type.node_type === 'job') {
            jobTypeObjects.push({
                name: node.node_type.job_type_name,
                version: node.node_type.job_type_version
            });
        } else if (node.node_type.node_type === 'recipe') {
            recipeTypeObjects.push({
                name: node.node_type.recipe_type_name
            });
        }
    });
    _.forEach(jobTypeObjects, jto => {
        jobTypes.push(require(`../data/job-type-details/${jto.name}${jto.version}.json`));
    });
    _.forEach(recipeTypeObjects, rto => {
        subRecipeTypes.push(require(`../data/recipe-type-details/recipe-type=details-${rto.name}.json`));
    });
    const now = moment.utc().toISOString();
    return {
        id: 99,
        name: _.kebabCase(request.payload.title),
        title: request.payload.title,
        description: request.payload.description,
        is_active: true,
        is_system: false,
        revision_num: 1,
        definition: request.payload.definition,
        job_types: jobTypes,
        sub_recipe_types: subRecipeTypes,
        created: now,
        deprecated: null,
        last_modified: now
    };
};
