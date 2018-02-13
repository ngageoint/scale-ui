module.exports = function (request, reply) {
    const status = require('../data/status.json');
    reply(status);
};
