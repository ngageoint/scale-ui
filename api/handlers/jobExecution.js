module.exports = function (request, reply) {
    const jobExecution = require('../data/job-execution.json');
    reply(jobExecution);
};
