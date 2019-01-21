const moment = require('moment');

module.exports = function (request) {
    return {
        id: 1,
        name: request.payload.name,
        title: request.payload.title,
        description: request.payload.description,
        file_count: 50,
        job: {
            id: 7,
            job_type: {
                id: 2,
                name: "scale-scan",
                version: "1.0.0",
                title: "Scale Scan",
                description: "Scans a workspace for existing source files to ingest",
                revision_num: 1,
                icon_code: "f0e7"
            },
            status: "RUNNING"
        },
        dry_run_job: {
            id: 6,
            job_type: {
                id: 2,
                name: "scale-scan",
                version: "1.0.0",
                title: "Scale Scan",
                description: "Scans a workspace for existing source files to ingest",
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
