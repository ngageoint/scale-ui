// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    runtime: false, // if true, values below will be overwritten at app runtime by /assets/environment.json
    apiDefaultVersion: 'v6',
    apiPrefix: '/mocks',
    // apiPrefix: 'https://scale-ui-api.azurewebsites.net/mocks',
    // apiPrefix: 'http://scale.alpha.aisohio.net/api',
    apiVersions: [],
    auth: {
        enabled: false,
        scheme: {
            type: 'external', // geoaxis, form, or external
            url: 'http://scale.alpha.aisohio.net/api/login/' // geoaxis endpoint, form post endpoint, or redirect url
            // url: 'http://scale.alpha.aisohio.net/api/social-auth/login/geoaxis/?='
        }
    },
    dateFormat: 'YYYY-MM-DD HH:mm:ss[Z]',
    defaultTheme: 'light',
    scale: true,
    siloUrl: 'http://ec2-18-217-60-133.us-east-2.compute.amazonaws.com',
    themeKey: 'scale.theme'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
