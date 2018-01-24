const _ = require('lodash');
const moment = require('moment');

module.exports = function (request, reply) {
    var params = request.url.query;
    var data = {
        count: 2,
        next: null,
        previous: null,
        results: []
    };
    var processor1 = {
        strike: {
            id: 1,
            name: 'landsat',
            title: 'Landsat Processor',
            description: 'This strike process handles Landsat data',
            job: {
                id: 12345,
                job_type: {
                    id: 2,
                    name: 'scale-strike',
                    version: '1.0',
                    title: 'Scale Strike',
                    description: 'Monitors a directory for incoming source files to ingest',
                    category: 'system',
                    author_name: null,
                    author_url: null,
                    is_system: true,
                    is_long_running: true,
                    is_active: true,
                    is_operational: true,
                    is_paused: false,
                    icon_code: 'f013'
                },
                event: {
                    id: 12345
                },
                error: null,
                status: 'RUNNING',
                priority: 5,
                num_exes: 10
            },
            created: '',
            last_modified: ''
        },
        most_recent: '',
        files: 2,
        size: 123456789,
        values: []
    };
    var processor2 = {
        strike: {
            id: 2,
            name: 'worldview',
            title: 'Worldview Processor',
            description: 'This strike process handles WorldView data',
            job: {
                id: 4,
                job_type: {
                    id: 2,
                    name: 'scale-strike',
                    version: '1.0',
                    title: 'Scale Strike',
                    description: 'Monitors a directory for incoming source files to ingest',
                    category: 'system',
                    author_name: null,
                    author_url: null,
                    is_system: true,
                    is_long_running: true,
                    is_active: true,
                    is_operational: true,
                    is_paused: false,
                    icon_code: 'f013'
                },
                event: {
                    id: 5
                },
                error: null,
                status: 'RUNNING',
                priority: 5,
                num_exes: 20
            },
            created: '2018-01-24T00:00:00.000Z',
            last_modified: '2018-01-24T00:00:00.000Z'
        },
        most_recent: '',
        files: 1234,
        size: 1234,
        values: []
    };

    var getValues = function (processor) {
        var started = moment.utc(params.started),
            ended = moment.utc(params.ended);

        for (var i = 0; i < Math.floor(Math.random() * (1000 - 100 + 1)) + 100; i++) {
            processor.values.push({
                time: moment.utc(started + Math.random() * (ended - started)).toISOString(),
                files: Math.floor(Math.random() * (500 - 1 + 1)) + 1,
                size: Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000
            });
        }
        processor.most_recent = _.orderBy(processor.values, ['time'], ['desc'])[0];
        data.results.push(processor);
    };

    getValues(processor1);
    getValues(processor2);

    reply(data);
};
