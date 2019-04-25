const _ = require('lodash');
const moment = require('moment');

module.exports = function (request) {
    var params = request.query;
    var data = {
        count: 10,
        next: 'http://localhost/api/jobs/1/inputs/?page=2',
        previous: null,
        results: []
    };
    var start = params.started ? moment.utc(params.started) : moment.utc().subtract(1, 'd');
    var stop = params.ended ? moment.utc(params.ended) : moment.utc();
    for (var i = 0; i < 10; i++) {
        var date = moment.utc(start.valueOf() + Math.random() * (stop.valueOf() - start.valueOf())).toISOString();
        data.results.push({
                id: 7,
                file_name: 'foo.bar',
                file_path: 'file/path/foo.bar',
                file_type: 'SOURCE',
                file_size: 100,
                media_type: 'text/plain',
                data_type: '',
                meta_data: {},
                url: 'http://localhost/foo.bar',
                source_started: moment.utc(date).subtract(5, 'm').toISOString(),
                source_ended: moment.utc(date).subtract(2, 'm').toISOString(),
                data_started: moment.utc(date).subtract(4, 'm').toISOString(),
                data_ended: moment.utc(date).subtract(1, 'm').toISOString(),
                created: moment.utc(date).subtract(7, 'm').toISOString(),
                deleted: null,
                last_modified: date,
                uuid: '',
                is_deleted: false,
                workspace: {
                id: 19,
                    name: 'workspace-19'
            },
            countries: ['TCY', 'TCT'],
            geometry: null,
            center_point: null
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

    return data;
};
