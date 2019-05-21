const moment = require('moment');

module.exports = function (request) {
    return {
        id: 1,
        name: _.kebabCase(request.payload.title),
        title: request.payload.title,
        description: request.payload.description,
        base_url: request.payload.base_url,
        is_active: request.payload.is_active,
        created: moment.utc().toISOString(),
        deprecated: null,
        last_modified: moment.utc().toISOString(),
        configuration: request.payload.configuration
    };
};
