// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    runtime: false,

    // when runtime is true, values below will be overwritten by /assets/environment.json
    siloUrl: 'http://ec2-18-217-60-133.us-east-2.compute.amazonaws.com',
    apiPrefix: '/mocks',
    // apiPrefix: 'https://scale-ui-api.azurewebsites.net/mocks',
    // apiPrefix: 'http://scale.alpha.aisohio.net/api',
    apiDefaultVersion: 'v6',
    apiVersions: [],

    // these values are unique to this environment file
    production: false,
    scale: true,
    dateFormat: 'YYYY-MM-DD HH:mm:ss[Z]',
    defaultTheme: 'light',
    auth: {
        enabled: false,
        scheme: {
            type: 'external', // geoaxis, form, or external
            // url: 'http://scale.alpha.aisohio.net/api/social-auth/login/geoaxis/?=' // geoaxis endpoint or form post endpoint
            url: 'http://scale.alpha.aisohio.net/api/login/' // geoaxis endpoint, form post endpoint, or redirect url
        }
    }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
