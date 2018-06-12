var moment = require('moment');

module.exports = function (request, reply) {
    var params = request.url.query;
    var maxLines = params.started ? 2 : 500;
    var log = {
        hits: {
            hits: []
        }
    };
    var lines = Math.floor(Math.random() * ((maxLines - 1) + 1) + 1);
    for (var i = 0; i < lines; i++) {
        var rand = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
        var lineType = rand === 1 ? 'stdout' : 'stderr';
        log.hits.hits.push({
            _source: {
                message: 'This is a ' + lineType + ' message\r\n',
                '@timestamp': moment.utc().toISOString(),
                scale_order_num: i,
                scale_task: '',
                scale_job_exe: '',
                scale_node: 'node' + i,
                stream: lineType
            }
        });
    }
    reply(log);
};
