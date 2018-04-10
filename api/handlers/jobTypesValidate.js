module.exports = function (request, reply) {
    var warnings = [];
    if (!request.payload.manifest) {
        warnings.push({
            id: 'Missing Manifest',
            details: 'Job Type Seed Manifest is undefined'
        });
    }
    reply({
        warnings: warnings
    });
};
