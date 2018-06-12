const _ = require('lodash');
const moment = require('moment');

module.exports = function (request, reply) {
    var params = request.url.query;
    var data = {
        count: 5,
        next: null,
        previous: null,
        results: []
    };
    var start = params.started ? moment.utc(params.started) : moment.utc().subtract(1, 'd');
    var stop = params.ended ? moment.utc(params.ended) : moment.utc();
    for (var i = 0; i < 5; i++) {
        var date = moment.utc(start.valueOf() + Math.random() * (stop.valueOf() - start.valueOf())).toISOString();
        var statusValues = ['CANCELED', 'COMPLETED', 'FAILED', 'PENDING', 'QUEUED', 'RUNNING'];
        var status = statusValues[Math.floor(Math.random() * (statusValues.length))];
        data.results.push({
            id: Math.floor(Math.random() * (1000 - 1 + 1)) + 1,
            status: status,
            exe_num: 1,
            cluster_id: 'scale_job_1234_263x0',
            created: moment.utc(date).subtract(5, 'm').toISOString(),
            queued: moment.utc(date).subtract(4, 'm').toISOString(),
            started: moment.utc(date).subtract(3, 'm').toISOString(),
            ended: moment.utc(date).subtract(2, 'm').toISOString(),
            job: {
                id: 3
            },
            node: {
                id: 1,
                hostname: 'machine.com'
            },
            error: status === 'FAILED' ?
                {
                    id: 1,
                    name: 'unknown',
                    title: 'Unknown',
                    description: 'The error that caused the failure is unknown.',
                    category: 'SYSTEM',
                    is_builtin: true,
                    created: moment.utc(date).subtract(5, 'm').toISOString(),
                    last_modified: moment.utc(date).subtract(2, 'm').toISOString()
                } :
                null,
            job_type: {
                id: 1,
                name: 'scale-ingest',
                version: '1.0',
                title: 'Scale Ingest',
                description: 'Ingests a source file into a workspace',
                category: 'system',
                author_name: null,
                author_url: null,
                is_system: true,
                is_long_running: false,
                is_active: true,
                is_operational: true,
                is_paused: false,
                icon_code: 'f013'
            },
            timeout: 1800,
            input_file_size: 10.0
        });
    }
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
