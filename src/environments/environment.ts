// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    scale: true,
    siloUrl: 'http://ec2-18-217-60-133.us-east-2.compute.amazonaws.com',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    apiPrefix: '/mocks',
    apiDefaultVersion: 'v5',
    apiVersions: [{
            endpoint: 'job-executions',
            version: 'v5'
        }, {
            endpoint: 'job-types',
            version: 'v5'
        }, {
            endpoint: 'recipe-types',
            version: 'v5'
        }, {
            endpoint: 'workspaces',
            version: 'v5'
        }, {
            endpoint: 'ingests',
            version: 'v5'
        }, {
            endpoint: 'metrics',
            version: 'v5'
        }, {
            endpoint: 'sources',
            version: 'v5'
        }, {
            endpoint: 'status',
            version: 'v5'
        }, {
            endpoint: 'jobs',
            version: 'v5'
        }, {
            endpoint: 'products',
            version: 'v5'
        }, {
            endpoint: 'load',
            version: 'v5'
        }, {
            endpoint: 'recipes',
            version: 'v5'
        }, {
            endpoint: 'running-jobs',
            version: 'v5'
        }
    ]
};
