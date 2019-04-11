const _ = require('lodash');

module.exports = function (request) {
    var warnings = [];
    var errors = [];
    var nodes = {};
    if (!request.payload.manifest) {
        warnings.push({
            id: 'Missing Manifest',
            details: 'Job Type Seed Manifest is undefined'
        });
    }
    _.forEach(_.keys(request.payload.definition.nodes), function (key) {
        nodes[key] = {
            status: 'UNCHANGED',
            changes: [],
            reprocess_new_node: false,
            force_reprocess: false,
            dependencies: request.payload.definition.nodes[key].dependencies,
            node_type: request.payload.definition.nodes[key].node_type
        }
    });
    return {
        is_valid: errors.length === 0,
        warnings: warnings,
        errors: errors,
        diff: {
            can_be_reprocessed: true,
            reasons: [],
            nodes: nodes
        }
    };
};
