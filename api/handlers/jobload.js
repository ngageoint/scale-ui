const moment = require('moment');


module.exports = function (request, reply) {

    var numHours = moment.utc().endOf('d').diff(moment.utc().subtract(7, 'd').startOf('d'), 'h');
    var startTime = moment.utc().subtract(7, 'd').startOf('d');
    var data = {
        count: numHours,
        next: null,
        previous: null,
        results: []
    };

    for (var i = 0; i < data.count; i++) {
        data.results.push({
            time: moment.utc(startTime).add(i, 'h').toISOString(),
            pending_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20,
            queued_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20,
            running_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20
        });
    }

    reply(data);
}
