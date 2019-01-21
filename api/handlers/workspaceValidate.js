const success = require('../data/validationSuccess');
const failure = require('../data/validationFailure');

module.exports = function (request) {
    const payload = request.payload;
    if (payload.name && payload.title && payload.description && payload.base_url && payload.is_active && payload.configuration) {
        return success;
    }
    return failure;
};
