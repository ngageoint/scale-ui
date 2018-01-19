const moment = require('moment');
const _ = require('lodash');

module.exports = function (request, reply) {
    var params = request.url.query;
    var numHours = moment.utc(params.ended).diff(moment.utc(params.started), 'h');
    var data = {
        count: numHours,
        next: null,
        previous: null,
        results: []
    };

    for (var i = 0; i < data.count; i++) {
        data.results.push({
            time: moment.utc(params.started).add(i, 'h').toISOString(),
            pending_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20,
            queued_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20,
            running_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20
        });
    }

    reply(data);
};
