const hello = require('./handlers/hello');


module.exports = {
    init: function(server) {
        server.route({
            method: 'GET',
            path: '/hello',
            handler: hello
        });
    }
}
