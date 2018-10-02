module.exports = function (request) {
    var warnings = [];
    if (!request.payload.manifest) {
        warnings.push({
            id: 'Missing Manifest',
            details: 'Job Type Seed Manifest is undefined'
        });
    }
    return {
        warnings: warnings
    };
};
