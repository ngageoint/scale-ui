const hello = require('./handlers/hello');
const jobLoad = require('./handlers/jobload');
const recipes = require('./handlers/recipes');
const recipeTypes = require('./handlers/recipeTypes');
const recipeDetails = require('./handlers/recipeDetails');
const jobs = require('./handlers/jobs');
const runningJobs = require('./handlers/runningJobs');
const jobTypes = require('./handlers/jobTypes');
const jobTypesValidate = require('./handlers/jobTypesValidate');
const jobTypesStatus = require('./handlers/jobTypesStatus');
const jobDetails = require('./handlers/jobDetails');
const jobTypeDetails = require('./handlers/jobTypeDetails');
const jobTypeUpdate = require('./handlers/jobTypeUpdate');
const recipeTypeDetails = require('./handlers/recipeTypeDetails');
const workspaces = require('./handlers/workspaces');
const sources = require('./handlers/sources');
const sourceDetails = require('./handlers/sourceDetails');
const sourceDescendants = require('./handlers/sourceDescendants');
const metrics = require('./handlers/metrics');
const metricsDataTypes = require('./handlers/metricsDataTypeOptions');
const metricsPlotData = require('./handlers/metricsPlotData');
const jobExecutionLogs = require('./handlers/jobExecutionLogs');
const jobExecution = require('./handlers/jobExecution');
const ingestsStatus = require('./handlers/ingestsStatus');
const status = require('./handlers/status');
const jobInputs = require('./handlers/jobInputs');
const products = require('./handlers/products');
const jobExecutions = require('./handlers/jobExecutions');

const apiVersion = 'v5';

module.exports = {
    init: function(server) {
        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/hello',
            handler: hello
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/load/',
            handler: jobLoad
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/recipes/',
            handler: recipes
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/recipe-types/',
            handler: recipeTypes
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/recipes/{id}/',
            handler: recipeDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/recipe-types/{id}/',
            handler: recipeTypeDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/jobs/',
            handler: jobs
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/jobs/{id}/',
            handler: jobDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/job-types/running/',
            handler: runningJobs
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/job-types/',
            handler: jobTypes
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/job-types/validate/',
            handler: jobTypesValidate
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/job-types/status/',
            handler: jobTypesStatus
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/job-types/{id}/',
            handler: jobTypeDetails
        });

        server.route({
            method: 'PATCH',
            path: '/mocks/' + apiVersion + '/job-types/{id}/',
            handler: jobTypeUpdate
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/workspaces/',
            handler: workspaces
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/sources/',
            handler: sources
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/sources/{id}/',
            handler: sourceDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/sources/{id}/{type}/',
            handler: sourceDescendants
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/metrics/',
            handler: metrics
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/metrics/job-types/',
            handler: metricsDataTypes
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/metrics/ingest/',
            handler: metricsDataTypes
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/metrics/error-types/',
            handler: metricsDataTypes
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/metrics/{type}/plot-data/',
            handler: metricsPlotData
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/job-executions/{id}/logs/combined/',
            handler: jobExecutionLogs
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/job-executions/{id}/',
            handler: jobExecution
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/ingests/status/',
            handler: ingestsStatus
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/status/',
            handler: status
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/jobs/{id}/input_files/',
            handler: jobInputs
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/products/',
            handler: products
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/jobs/{id}/executions/',
            handler: jobExecutions
        });
    }
};
