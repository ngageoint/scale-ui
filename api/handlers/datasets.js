const _ = require('lodash');
const datasets = require('../data/datasets.json');

module.exports = function (request) {
    var data = _.clone(datasets);
    var params = request.query;
    if (_.keys(params).length > 0) {
        if (params.order) {
            if (_.startsWith(params.order, '-')) {
                data.results = _.orderBy(data.results, [_.trimStart(params.order, '-')], ['desc']);
            } else {
                data.results = _.orderBy(data.results, [params.order], ['asc']);
            }
        }
        if (params.dataset_id) {
            data.results = _.filter(data.results, r => {
                debugger;
                if (Array.isArray(params.dataset_id)) {
                    return _.includes(params.dataset_id, r.strike.id.toString());
                }
                return r.strike.id === +params.dataset_id;
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
