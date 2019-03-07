const Hapi = require('hapi');
const env = process.env;

const router = require('./router');


const server = new Hapi.Server({
    port: 8081,
    host: env.IP || '0.0.0.0'
});

router.init(server);

server.start(function (err) {
    if (err) {
        throw err;
    }
    console.log('Server running at: ' + server.info.uri);
});
