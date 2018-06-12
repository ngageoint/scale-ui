var hello = require('./handlers/hello');
var jobLoad = require('./handlers/jobload');
var recipes = require('./handlers/recipes');
var recipeTypes = require('./handlers/recipeTypes');
var recipeDetails = require('./handlers/recipeDetails');
var jobs = require('./handlers/jobs');
var runningJobs = require('./handlers/runningJobs');
var jobTypes = require('./handlers/jobTypes');
var jobTypesValidate = require('./handlers/jobTypesValidate');
var jobTypesStatus = require('./handlers/jobTypesStatus');
var jobDetails = require('./handlers/jobDetails');
var jobTypeDetails = require('./handlers/jobTypeDetails');
var jobTypeUpdate = require('./handlers/jobTypeUpdate');
var recipeTypeDetails = require('./handlers/recipeTypeDetails');
var workspaces = require('./handlers/workspaces');
var sources = require('./handlers/sources');
var sourceDetails = require('./handlers/sourceDetails');
var sourceDescendants = require('./handlers/sourceDescendants');
var metrics = require('./handlers/metrics');
var metricsDataTypes = require('./handlers/metricsDataTypeOptions');
var metricsPlotData = require('./handlers/metricsPlotData');
var jobExecutionLogs = require('./handlers/jobExecutionLogs');
var jobExecution = require('./handlers/jobExecution');
var ingestsStatus = require('./handlers/ingestsStatus');
var status = require('./handlers/status');
var jobInputs = require('./handlers/jobInputs');
var products = require('./handlers/products');
var jobExecutions = require('./handlers/jobExecutions');

var apiVersion = 'v6';

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
            path: '/mocks/' + apiVersion + '/job-types/validation/',
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
