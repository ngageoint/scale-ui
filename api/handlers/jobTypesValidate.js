module.exports = function (request) {
    var warnings = [];
    var errors = [];
    if (!request.payload.manifest) {
        errors.push({
            id: 'Missing Manifest',
            details: 'Job Type Seed Manifest is undefined'
        });
    }
    return {
        is_valid: errors.length === 0,
        warnings: warnings,
        errors: errors
    };
};
