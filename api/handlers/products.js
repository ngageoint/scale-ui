const _ = require('lodash');
const moment = require('moment');

module.exports = function (request, reply) {
    var params = request.url.query;
    var data = {
        count: 15,
        next: null,
        previous: null,
        results: []
    };
    var start = params.started ? moment.utc(params.started) : moment.utc().subtract(1, 'd');
    var stop = params.ended ? moment.utc(params.ended) : moment.utc();
    // for (var i = 0; i < 15; i++) {
    //     var date = moment.utc(start.valueOf() + Math.random() * (stop.valueOf() - start.valueOf())).toISOString();
    //     data.results.push({});
    // }
    if (_.keys(params).length > 0) {
        // if (params.started && params.ended) {
        //     data.results = _.filter(data.results, function (result) {
        //         return moment.utc(result.started).isSameOrAfter(moment.utc(params.started)) && moment.utc(result.ended).isSameOrBefore(moment.utc(params.ended));
        //     });
        // }
        data.count = data.results.length;
        if (params.page && params.page_size && data.count > params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    reply(data);
};
