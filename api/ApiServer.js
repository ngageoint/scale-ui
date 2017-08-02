const Hapi = require('hapi');
const env = process.env;

const server = new Hapi.Server();
server.connection({
    port: 8081,
    host: env.IP || 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
