const _ = require('lodash');
const moment = require('moment');
const recipes = require('../data/recipes.json');

module.exports = function (request) {
    var data = _.clone(recipes);
    var params = request.url.query;
    if (_.keys(params).length > 0) {
        if (params.type_name) {
            data.results = _.filter(data.results, function (r) {
                return r.recipe_type.name.toLowerCase().includes(params.type_name);
            });
        }
        if (params.order) {
            if (_.startsWith(params.order, '-')) {
                data.results = _.orderBy(data.results, [_.trimStart(params.order, '-')], ['desc']);
            } else {
                data.results = _.orderBy(data.results, [params.order], ['asc']);
            }
        }
        if (params.started && params.ended) {
            data.results = _.filter(data.results, function (result) {
                return moment.utc(result.created).isSameOrAfter(moment.utc(params.started)) && moment.utc(result.last_modified).isSameOrBefore(moment.utc(params.ended));
            });
        }
        data.count = data.results.length;
        if (params.page && params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    return data;
};
