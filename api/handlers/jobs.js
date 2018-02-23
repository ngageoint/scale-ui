const _ = require('lodash');
const moment = require('moment');
const jobTypes = require('../data/job-types.json');

module.exports = function (request, reply) {
    var jobTypeData = _.clone(jobTypes);
    var params = request.url.query;
    var data = {
        count: 500,
        next: 'http://localhost/api/jobs/?page=2',
        previous: null,
        results: []
    };
    var statusValues = ['CANCELED', 'COMPLETED', 'FAILED', 'PENDING', 'QUEUED', 'RUNNING'];
    var start = params.started ? moment.utc(params.started) : moment.utc().subtract(1, 'd');
    var stop = params.ended ? moment.utc(params.ended) : moment.utc();
    for (var i = 0; i < 500; i++) {
        var jobTypeIdx = Math.floor(Math.random() * (jobTypeData.results.length));
        var date = moment.utc(start.valueOf() + Math.random() * (stop.valueOf() - start.valueOf())).toISOString();
        var statusValue = statusValues[Math.floor(Math.random() * (statusValues.length))];
        data.results.push({
            id: i,
            job_type: jobTypeData.results[jobTypeIdx],
            job_type_rev: {
                id: 56,
                job_type: {
                    id: 1
                },
                revision_num: 4
            },
            event: {
                id: 70,
                type: 'STRIKE_TRANSFER',
                occurred: '2016-04-27T19:11:57Z'
            },
            node: {
                id: 1,
                hostname: 'my-host.example.domain'
            },
            error: {
                title: 'test',
                category: 'none',
                description: 'This is just a test error to see what it looks like in the jobs table. This is just a test error to see what it looks like in the jobs table. This is just a test error to see what it looks like in the jobs table. This is just a test error to see what it looks like in the jobs table. This is just a test error to see what it looks like in the jobs table. This is just a test error to see what it looks like in the jobs table. This is just a test error to see what it looks like in the jobs table. This is just a test error to see what it looks like in the jobs table. This is just a test error to see what it looks like in the jobs table. '
            },
            status: statusValue,
            priority: 97,
            num_exes: 94,
            timeout: 2317,
            max_tries: 2,
            input_file_size: 79.8,
            is_superseded: Math.floor(Math.random() * (2 - 1 + 1) + 1) % 2 === 0,
            created: moment.utc(date).subtract(12, 'm').toISOString(),
            queued: moment.utc(date).subtract(10, 'm').toISOString(),
            started: moment.utc(date).subtract(5, 'm').toISOString(),
            ended: moment.utc(date).subtract(Math.floor(Math.random() * (299 - 15)) + 15, 's').toISOString(),
            last_status_change: moment.utc(date).subtract(20, 's').toISOString(),
            last_modified: moment.utc(date).subtract(10, 's').toISOString()
        });
    }
    // var data = _.clone(jobs);
    if (_.keys(params).length > 0) {
        if (params.job_type_id) {
            data.results = _.filter(data.results, function (r) {
                if (Array.isArray(params.job_type_id)) {
                    return _.includes(params.job_type_id, r.job_type.id.toString());
                }
                return r.job_type.id === parseInt(params.job_type_id);
            });
        }
        if (params.order) {
            if (_.startsWith(params.order, '-')) {
                data.results = _.orderBy(data.results, [_.trimStart(params.order, '-')], ['desc']);
            } else {
                data.results = _.orderBy(data.results, [params.order], ['asc']);
            }
        }
        if (params.status) {
            data.results = _.filter(data.results, function (result) {
                return result.status === params.status;
            });
        }
        if (params.error_category) {
            data.results = _.filter(data.results, function (result) {
                return result.error_category === params.error_category;
            });
        }
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
