export const environment = {
    production: true,
    runtime: false, // if true, values below will be overwritten at app runtime by /assets/environment.json
    apiDefaultVersion: 'v6',
    apiPrefix: 'https://scale-ui-api.azurewebsites.net/mocks',
    // apiPrefix: 'http://scale.alpha.aisohio.net/api',
    apiVersions: [],
    auth: {
        enabled: false,
        scheme: {
            type: 'redirect',
            url: 'http://scale.alpha.aisohio.net/api/login/'
        }
    },
    dateFormat: 'YYYY-MM-DD HH:mm:ss[Z]',
    defaultTheme: 'light',
    scale: true,
    siloUrl: 'http://ec2-18-217-60-133.us-east-2.compute.amazonaws.com'
};
