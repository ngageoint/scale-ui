module.exports = function (request, reply) {
    const warnings = [];
    if (!request.payload.name) {
        warnings.push({
            id: 'Missing Name',
            details: 'Job Type Name is undefined'
        });
    }
    if (!request.payload.version) {
        warnings.push({
            id: 'Missing Version',
            details: 'Job Type Version is undefined'
        });
    }
    if (!request.payload.interface.command) {
        warnings.push({
            id: 'Missing Interface Command',
            details: 'Job Type Interface Command is undefined'
        });
    }
    if (!request.payload.interface.command_arguments) {
        warnings.push({
            id: 'Missing Interface Command Arguments',
            details: 'Job Type Interface Command Arguments are undefined'
        });
    }
    reply({
        warnings: warnings
    });
};
