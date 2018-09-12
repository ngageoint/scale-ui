module.exports = function (request, reply) {
    var batchValidate = require('../data/batch-validate.json');
    reply(batchValidate);
};
