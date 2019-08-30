# Scale UI

[![Build Status](https://travis-ci.org/ngageoint/scale-ui.svg?branch=master)](https://travis-ci.org/ngageoint/scale-ui)

Scale UI provides a graphical interface to interact with the Scale framework via its REST API. This project was generated with the Angular CLI and has been set up as an Angular workspace to allow for future expansion. The base UI project is named "developer".  

## Development server

Run `npm run dev` to start a development server for the developer project. Navigate to `http://localhost:8080/`. The app will automatically reload if you change any of the source files.

### Using real API servers

Change `"apiPrefix"` in `src/assets/appConfig.json` to point to one of these proxies (defined in `proxy.conf.json`):

- `/mocks`: built-in development server above with mock data
- `/local`: a locally installed Scale server
- `/alpha` and `/omega`: the live test clusters

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build developer` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Deployment

#### App config

A dynamic config file is loaded when the web app first starts, using values in [`assets/appConfig.json`](projects/developer/src/assets/appConfig.json). Each key in this file will be camel-cased and injected into the Angular `environments`. JSON decoding is attempted for each value, allowing `true`/`false` or numerical values.

The defaults provided in this file are used for local development. Override them during deployment (mainly the API and auth sections).

#### Using environment variables

When using the Docker image, any environment variable prefixed with `SCALEUI_` is injected into the `appConfig.json` file. Environment variables are stripped of the prefix and lowercased, then injected into `appConfig.json`.

For example:
1. `SCALEUI_MY_CONFIG_VALUE=true` is set when running the Docker image
2. On startup, the Docker image converts this to `"my_config_value": "true"` and places it in `appConfig.json`
3. When the webapp is loaded in the browser, `"my_config_value"` is converted to `myConfigValue` and the value is converted from `"true"` to `true`
4. A component or service then uses `environment.myConfigValue`


#### Available config options

These are the keys in `appConfig.json` / their environment variable equivalents (the default values) - and a description:

- `apiDefaultVersion`/`SCALEUI_API_DEFAULT_VERSION` (`"v6"`) - the API version for building URL endpoints
- `apiPrefix`/`SCALEUI_API_PREFIX` (`"/mocks"`) - the prefix endpoint for building URL endpoints (defaults to mock API server for local dev)
- `apiVersions`/`SCALEUI_API_VERSIONS` (`[]`)
- `authEnabled`/`SCALEUI_AUTH_ENABLED` (`false`) - boolean for whether or not the auth is enabled for the backend (turned off for local dev against mock API)
- `authSchemeType`/`SCALEUI_AUTH_SCHEME_TYPE` (`"external"`) - how authentication is handled, either `external`, `form`, or `geoaxis`
- `authSchemeUrl`/`SCALEUI_AUTH_SCHEME_URL` (`"/api/login/"`) - the URL endpoint for the login route of the authentication backend
- `dateFormat`/`SCALEUI_DATE_FORMAT` (`"YYYY-MM-DD HH:mm:ss[Z]"`) - the Moment.JS format string for formatting all dates
- `defaultTheme`/`SCALEUI_DEFAULT_THEME` (`"light"`) - the theme to default new users to, either `light` or `dark`
- `documentation`/`SCALEUI_DOCUMENTATION` (`"http://ngageoint.github.io/scale/docs/index.html"`) - the full external link to documentation (used in the footer)
- `siloUrl`/`SCALEUI_SILO_URL` (`"/mocks/silo"`) - the full endpoint to Silo
- `themeKey`/`SCALEUI_THEME_KEY` (`"scale.theme"`) - the key for retrieving user-specified themes from their localStorage
- `primaryColor`/`SCALEUI_PRIMARY_COLOR` (`"#017cce"`) - primary color in the theme (links, menus, etc), any rgba or hex value
- `secondaryLightColor`/`SCALEUI_SECONDARY_LIGHT_COLOR` (`"#5c97bf"`)
- `secondaryDarkColor`/`SCALEUI_SECONDARY_DARK_COLOR` (`"#24567f"`)
- `logoImageCss`/`SCALEUI_LOGO_IMAGE_CSS` (`""`) - any styles applied directly to the logo element
- `logoImage`/`SCALEUI_LOGO_IMAGE` (`""`) - any URL or data URL for the logo at the top, defaults to the standard Scale logo

#### Customizing the logo

Any URL to a direct image can be used, as well as any [data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs). Using a data URL allows the entire logo to reside in an environment variable or the `appConfig.json`, without having to host it externally. An image should be base64-encoded, and [SVG images](https://css-tricks.com/lodge/svg/09-svg-data-uris/) can be used directly, as long as they are properly escaped.


## Running unit tests

Run `ng test developer` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
