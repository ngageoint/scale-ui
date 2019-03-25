export const environment = {
    runtime: true,

    // when runtime is true, values below will be overwritten by /assets/environment.json
    siloUrl: 'http://ec2-18-217-60-133.us-east-2.compute.amazonaws.com',
    apiPrefix: 'https://scale-ui-api.azurewebsites.net/mocks',
    // apiPrefix: 'http://scale.alpha.aisohio.net/api',
    apiDefaultVersion: 'v6',
    apiVersions: [],

    // these values are unique to this environment file
    production: true,
    scale: true,
    dateFormat: 'YYYY-MM-DD HH:mm:ss[Z]',
    defaultTheme: 'light',
    auth: {
        enabled: false,
        scheme: {
            type: 'redirect',
            url: 'http://scale.alpha.aisohio.net/api/login/'
        }
    }
};
