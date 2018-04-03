const _ = require('lodash');
const moment = require('moment');
const jobTypeData = require('../data/job-types.json');

module.exports = function (request, reply) {
    var params = request.url.query;
    var data = {
        count: 15,
        next: null,
        previous: null,
        results: []
    };
    var jobTypes = jobTypeData.results;
    var start = params.started ? moment.utc(params.started) : moment.utc().subtract(1, 'd');
    var stop = params.ended ? moment.utc(params.ended) : moment.utc();
    for (var i = 0; i < 15; i++) {
        var date = moment.utc(start.valueOf() + Math.random() * (stop.valueOf() - start.valueOf())).toISOString();
        data.results.push({
            id: 465,
            workspace: {
                id: 2,
                name: 'Products'
            },
            file_name: 'my_file.kml',
            media_type: 'application/vnd.google-earth.kml+xml',
            file_size: 100,
            data_type: [],
            is_deleted: false,
            uuid: 'c8928d9183fc99122948e7840ec9a0fd',
            url: 'http://host.com/file/path/my_file.kml',
            created: date,
            deleted: null,
            data_started: null,
            data_ended: null,
            geometry: null,
            center_point: null,
            meta_data: {},
            countries: ['TCY', 'TCT'],
            last_modified: moment.utc(date).add(5, 'm').toISOString(),
            is_operational: true,
            is_published: true,
            has_been_published: true,
            published: moment.utc(date).add(1, 'm').toISOString(),
            unpublished: null,
            source_started: date,
            source_ended: moment.utc(date).add(30, 's').toISOString(),
            job_type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
            job: {
                id: 47
            },
            job_exe: {
                id: 49
            },
            recipe_type: {
                id: 6,
                    name: 'my-recipe',
                    version: '1.0.0',
                    title: 'My Recipe',
                    description: 'Processes some data'
            },
            recipe: {
                id: 60
            },
            batch: {
                id: 15,
                    title: 'My Batch',
                    description: 'My batch of recipes',
                    status: 'SUBMITTED',
                    recipe_type: 6,
                    event: 19,
                    creator_job: 62
            }
        });
    }
    if (_.keys(params).length > 0) {
        // if (params.started && params.ended) {
        //     data.results = _.filter(data.results, function (result) {
        //         return moment.utc(result.started).isSameOrAfter(moment.utc(params.started)) && moment.utc(result.ended).isSameOrBefore(moment.utc(params.ended));
        //     });
        // }
        if (params.job_type_id) {
            data.results = _.filter(data.results, function (r) {
                if (Array.isArray(params.job_type_id)) {
                    return _.includes(params.job_type_id, r.job_type.id.toString());
                }
                return r.job_type.id === parseInt(params.job_type_id);
            });
        }
        data.count = data.results.length;
        if (params.page && params.page_size && data.count > params.page_size) {
            var pagedResults = _.chunk(data.results, params.page_size);
            data.results = pagedResults[params.page - 1];
        }
    }

    reply(data);
};
