const success = require('../data/validationSuccess');
const failure = require('../data/validationFailure');

module.exports = function (request) {
    const payload = request.payload;
    if (payload.title && payload.description && payload.configuration) {
        if (payload.configuration.files_to_ingest && payload.configuration.files_to_ingest.length > 0) {
            return success;
        }
    }
    return failure;
};
