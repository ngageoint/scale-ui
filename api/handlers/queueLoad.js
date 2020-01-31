const moment = require('moment');

module.exports = function (request) {
    var params = request.query;
    const numHours = 24;
    const startTime =  params.ended;
    const data = {
        count: numHours,
        next: null,
        previous: null,
        results: []
    };

    for (let i = 0; i < data.count; i++) {
        data.results.push({
            time: moment.utc(startTime).add(i, 'h').toISOString(),
            pending_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20,
            queued_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20,
            running_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20
        });
    }

    return data;
};
