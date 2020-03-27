var recipes = require('./handlers/recipes');
var recipeTypes = require('./handlers/recipeTypes');
var recipeDetails = require('./handlers/recipeDetails');
var recipeTypeRev = require('./handlers/recipeTypeRev');
var recipeTypeTimeline = require('./handlers/recipeTypeTimeline');
var jobs = require('./handlers/jobs');
var runningJobs = require('./handlers/runningJobs');
var jobTypes = require('./handlers/jobTypes');
var jobTypesValidate = require('./handlers/jobTypesValidate');
var jobTypesStatus = require('./handlers/jobTypesStatus');
var jobDetails = require('./handlers/jobDetails');
var jobTypeDetails = require('./handlers/jobTypeDetails');
var jobTypeTimeline = require('./handlers/jobTypeTimeline');
var jobTypeUpdate = require('./handlers/jobTypeUpdate');
var recipeTypeDetails = require('./handlers/recipeTypeDetails');
var workspaces = require('./handlers/workspaces');
var workspaceDetails = require('./handlers/workspaceDetails');
var workspaceCreate = require('./handlers/workspaceCreate');
var workspaceEdit = require('./handlers/workspaceEdit');
var workspaceValidate = require('./handlers/workspaceValidate');
var metrics = require('./handlers/metrics');
var metricsDataTypes = require('./handlers/metricsDataTypeOptions');
var metricsPlotData = require('./handlers/metricsPlotData');
var jobExecutionLogs = require('./handlers/jobExecutionLogs');
var jobExecution = require('./handlers/jobExecution');
var ingestsStatus = require('./handlers/ingestsStatus');
var status = require('./handlers/status');
var jobInputs = require('./handlers/jobInputs');
var files = require('./handlers/files');
var jobExecutions = require('./handlers/jobExecutions');
var batches = require('./handlers/batches');
var batchesCreate = require('./handlers/batchCreate');
var batchesEdit = require('./handlers/batchEdit');
var batchDetails = require('./handlers/batchDetails');
var batchValidate = require('./handlers/batchValidate');

var datasets = require('./handlers/datasets');
var datasetCreate = require('./handlers/datasetCreate');
var datasetValidate = require('./handlers/datasetValidate');
var datasetAddMembers = require('./handlers/datasetAddMembers');

var strikes = require('./handlers/strikes');
var strikeDetails = require('./handlers/strikeDetails');
var strikeValidate = require('./handlers/strikeValidate');
var strikeEdit = require('./handlers/strikeEdit');
var strikeCreate = require('./handlers/strikeCreate');
var ingests = require('./handlers/ingests');
var ingestDetails = require('./handlers/ingestDetails');
var fileDetails = require('./handlers/fileDetails');
var nodes = require('./handlers/nodes');
var nodeDetails = require('./handlers/nodeDetails');
var nodeUpdate = require('./handlers/nodeUpdate');
var queueLoad = require('./handlers/queueLoad');
var queueStatus = require('./handlers/queueStatus');
var scans = require('./handlers/scans');
var scanDetails = require('./handlers/scanDetails');
var scanCreate = require('./handlers/scanCreate');
var scanEdit = require('./handlers/scanEdit');
var scanValidate = require('./handlers/scanValidate');
var scanCancel = require('./handlers/scanCancel');
var errors = require('./handlers/errors');
var recipeTypesValidate = require('./handlers/recipeTypesValidate');
var recipeTypeCreate = require('./handlers/recipeTypeCreate');
var recipeTypeEdit = require('./handlers/recipeTypeEdit');
var version = require('./handlers/version');
var siloJobs = require('./handlers/siloJobs');
var siloJobDetails = require('./handlers/siloJobDetails');
var siloManifestDetails = require('./handlers/siloManifestDetails');
var siloImageDetails = require('./handlers/siloImageDetails');
var scheduler = require('./handlers/scheduler');
var schedulerUpdate = require('./handlers/schedulerUpdate');

var apiVersion = 'v6';

module.exports = {
    init: function(server) {
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
            method: 'POST',
            path: '/mocks/' + apiVersion + '/recipes/{id}/reprocess/',
            handler: function () {
                return {};
            }
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/recipe-types/{name}/',
            handler: recipeTypeDetails
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/recipe-types/validation/',
            handler: recipeTypesValidate
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/recipe-types/',
            handler: recipeTypeCreate
        });

        server.route({
            method: 'PATCH',
            path: '/mocks/' + apiVersion + '/recipe-types/{name}/',
            handler: recipeTypeEdit
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/recipe-types/{name}/revisions/',
            handler: recipeTypeRev
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
            path: '/mocks/' + apiVersion + '/job-types/{name}/{version}/',
            handler: jobTypeDetails
        });

        server.route({
            method: 'PATCH',
            path: '/mocks/' + apiVersion + '/job-types/{name}/{version}/',
            handler: jobTypeUpdate
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/workspaces/',
            handler: workspaces
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/workspaces/{id}/',
            handler: workspaceDetails
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/workspaces/validation/',
            handler: workspaceValidate
        });

        server.route({
            method: 'PATCH',
            path: '/mocks/' + apiVersion + '/workspaces/${id}/',
            handler: workspaceEdit
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/workspaces/',
            handler: workspaceCreate
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
            path: '/mocks/' + apiVersion + '/files/',
            handler: files
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/jobs/{id}/executions/',
            handler: jobExecutions
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/batches/',
            handler: batches
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/batches/',
            handler: batchesCreate
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/batches/{id}/',
            handler: batchDetails
        });

        server.route({
            method: 'PATCH',
            path: '/mocks/' + apiVersion + '/batches/{id}/',
            handler: batchesEdit
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/batches/validation/',
            handler: batchValidate
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/datasets/',
            handler: datasets
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/datasets/',
            handler: datasetCreate
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/datasets/validation',
            handler: datasetValidate
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/datasets/1',
            handler: datasetAddMembers
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/strikes/',
            handler: strikes
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/strikes/{id}/',
            handler: strikeDetails
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/strikes/validation/',
            handler: strikeValidate
        });

        server.route({
            method: 'PATCH',
            path: '/mocks/' + apiVersion + '/strikes/${id}/',
            handler: strikeEdit
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/strikes/',
            handler: strikeCreate
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/ingests/',
            handler: ingests
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/ingests/{id}/',
            handler: ingestDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/files/{id}/',
            handler: fileDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/nodes/',
            handler: nodes
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/nodes/{id}/',
            handler: nodeDetails
        });

        server.route({
            method: 'PATCH',
            path: '/mocks/' + apiVersion + '/nodes/{id}/',
            handler: nodeUpdate
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/load/',
            handler: queueLoad
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/queue/status/',
            handler: queueStatus
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/scans/',
            handler: scans
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/scans/{id}/',
            handler: scanDetails
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/scans/validation/',
            handler: scanValidate
        });

        server.route({
            method: 'PATCH',
            path: '/mocks/' + apiVersion + '/scans/${id}/',
            handler: scanEdit
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/scans/',
            handler: scanCreate
        });

        server.route({
            method: 'POST',
            path: '/mocks/' + apiVersion + '/scans/cancel/{id}/',
            handler: scanCancel
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/errors/',
            handler: errors
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/version/',
            handler: version
        });

        server.route({
            method: 'GET',
            path: '/mocks/silo/jobs',
            handler: siloJobs
        });

        server.route({
            method: 'GET',
            path: '/mocks/silo/jobs/{id}',
            handler: siloJobDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/silo/images/{id}/manifest',
            handler: siloManifestDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/silo/images/{id}',
            handler: siloImageDetails
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/scheduler/',
            handler: scheduler
        });

        server.route({
            method: 'PATCH',
            path: '/mocks/' + apiVersion + '/scheduler/',
            handler: schedulerUpdate
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/timeline/recipe-types',
            handler: recipeTypeTimeline
        });

        server.route({
            method: 'GET',
            path: '/mocks/' + apiVersion + '/timeline/job-types',
            handler: jobTypeTimeline
        });
    }
};
