export const environment = {
    production: true,
    scale: true,
    siloUrl: 'http://ec2-18-217-60-133.us-east-2.compute.amazonaws.com',
    dateFormat: 'YYYY-MM-DD HH:mm:ss[Z]',
    defaultTheme: 'light',
    apiPrefix: 'https://scale-ui-api.azurewebsites.net/mocks',
    // apiPrefix: 'http://scale.alpha.aisohio.net/api',
    apiDefaultVersion: 'v6',
    apiVersions: [],
    auth: {
        enabled: false,
        scheme: {
            type: 'geoaxis', // geoaxis or form
            url: 'http://scale.alpha.aisohio.net/api/social-auth/login/geoaxis/?=' // required if geoaxis
        }
    }
};
