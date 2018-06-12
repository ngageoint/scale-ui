const metrics = require('../data/metrics.json');

module.exports = function (request, reply) {
    reply(metrics);
};
