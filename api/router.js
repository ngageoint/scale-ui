const hello = require('./handlers/hello');
const jobLoad = require('./handlers/jobload');
const recipes = require('./handlers/recipes');

module.exports = {
    init: function(server) {
        server.route({
            method: 'GET',
            path: '/mocks/hello',
            handler: hello
        });

        server.route({
            method: 'GET',
            path: '/mocks/jobload',
            handler: jobLoad
        });

        server.route({
            method: 'GET',
            path: '/mocks/recipes',
            handler: recipes
        });
    }
}
