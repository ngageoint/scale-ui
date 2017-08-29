module.exports = function (request, reply) {
    const sourceFileDetails = require('../data/source-file-details.json');
    reply(sourceFileDetails);
};
