const hello = require('./handlers/hello');
const jobLoad = require('./handlers/jobload');


module.exports = {
    init: function(server) {
        server.route({
            method: 'GET',
            path: '/hello',
            handler: hello
        });

        server.route({
            method: 'GET',
            path: '/load/job',
            handler: jobLoad
        })
    }
}
