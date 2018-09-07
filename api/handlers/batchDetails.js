module.exports = function (request, reply) {
    var batchDetails = require('../data/batch-details.json');
    reply(batchDetails);
};
