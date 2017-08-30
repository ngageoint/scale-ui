module.exports = function (request, reply) {
    const sourceDetails = require('../data/source-details.json');
    reply(sourceDetails);
};
