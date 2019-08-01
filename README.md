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

## Running unit tests

Run `ng test developer` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
