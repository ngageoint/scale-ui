const _ = require('lodash');
const sourceFiles = require('../data/source-files.json');

module.exports = function (request, reply) {
    var data = _.clone(sourceFiles);
    var params = request.url.query;
    if (_.keys(params).length > 0) {
        if (params.file_name) {
            data.results = _.filter(data.results, function (r) {
                return r.file_name.toLowerCase().includes(params.file_name);
            });
        }
        if (params.order) {
            if (_.startsWith(params.order, '-')) {
                data.results = _.orderBy(data.results, [_.trimStart(params.order, '-')], ['desc']);
            } else {
                data.results = _.orderBy(data.results, [params.order], ['asc']);
            }
        }
        data.count = data.results.length;
        if (params.page && params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    reply(data);
};
