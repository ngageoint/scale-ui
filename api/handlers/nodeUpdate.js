module.exports = function (request) {
    const nodeDetails = require('../data/node.json');
    nodeDetails.is_paused = request.payload.is_paused;
    nodeDetails.paused_reason = request.payload.paused_reason;
    nodeDetails.is_active = request.payload.is_active;
    return nodeDetails;
};
