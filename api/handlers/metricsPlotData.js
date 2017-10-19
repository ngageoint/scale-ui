const _ = require('lodash');
const moment = require('moment');

module.exports = function (request, reply) {
    var params = request.url.query;
    if (_.keys(params).length > 0) {
        var random = 0;

        var returnObj = {
            count: 28,
            next: null,
            previous: null,
            results: []
        };

        var numDays = moment.utc(params.ended).diff(moment.utc(params.started), 'd') + 1;

        if (!Array.isArray(params.column)) {
            params.column = [params.column];
        }
        _.forEach(params.column, function (metric) {
            var maxRandom = metric === 'total_count' ? 1000 : 200;
            var minRandom = metric === 'total_count' ? 800 : 10;
            var returnResult = {
                column: { title: _.startCase(metric) },
                min_x: moment.utc(params.started).format('YYYY-MM-DD'),
                max_x: moment.utc(params.ended).format('YYYY-MM-DD'),
                min_y: 1,
                max_y: 1000,
                values: []
            };

            for (var i = 0; i < numDays; i++) {
                if (params.choice_id && params.choice_id.length > 1) {
                    _.forEach(params.choice_id, function (id) {
                        random = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
                        if (random <= 4) {
                            var value = Math.floor(Math.random() * (maxRandom - minRandom + 1)) + minRandom;
                            returnResult.values.push({
                                date: moment.utc(params.started).add(i, 'd').format('YYYY-MM-DD'),
                                value: value,
                                id: parseInt(id)
                            });
                        }
                    });
                } else {
                    random = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
                    if (random <= 4) {
                        returnResult.values.push({
                            date: moment.utc(params.started).add(i, 'd').format('YYYY-MM-DD'),
                            value: Math.floor(Math.random() * (maxRandom - minRandom + 1)) + minRandom
                        });
                    }
                }
            }
            returnObj.results.push(returnResult);
        });
    }

    reply(returnObj);
};
