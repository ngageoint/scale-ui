const moment = require('moment');

module.exports = function (request) {
    return {
        id: 1,
        name: _.kebabCase(request.payload.title),
        title: request.payload.title,
        description: request.payload.description,
        job: {
            id: 7,
            job_type: {
                id: 2,
                name: "scale-strike",
                version: "1.0.0",
                title: "Scale Strike",
                description: "Monitors a directory for incoming source files to ingest",
                revision_num: 1,
                icon_code: "f0e7"
            },
            status: "RUNNING"
        },
        created: moment.utc().toISOString(),
        last_modified: moment.utc().toISOString(),
        configuration: request.payload.configuration
    };
};
