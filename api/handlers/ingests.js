const _ = require('lodash');
const ingests = require('../data/ingests.json');

module.exports = function (request) {
    var data = _.clone(ingests);
    var params = request.query;
    if (_.keys(params).length > 0) {
        if (params.order) {
            if (_.startsWith(params.order, '-')) {
                data.results = _.orderBy(data.results, [_.trimStart(params.order, '-')], ['desc']);
            } else {
                data.results = _.orderBy(data.results, [params.order], ['asc']);
            }
        }
        if (params.strike_id) {
            data.results = _.filter(data.results, r => {
                if (Array.isArray(params.strike_id)) {
                    return _.includes(params.strike_id, r.strike.id.toString());
                }
                return r.strike.id === +params.strike_id;
            });
        }
        if (params.status) {
            data.results = _.filter(data.results, r => {
                if (Array.isArray(params.status)) {
                    return _.includes(params.status, r.status);
                }
                return r.status === params.status;
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
