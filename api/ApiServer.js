const Hapi = require('hapi');
const env = process.env;

const router = require('./router');


const server = new Hapi.Server();
server.connection({
    port: 8081,
    host: env.IP || 'localhost'
});

router.init(server);

server.start(function (err) {
    if (err) {
        throw err;
    }
    console.log('Server running at: ' + server.info.uri);
});
