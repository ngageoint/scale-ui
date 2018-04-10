# Seed Images
An Angular component for [Seed](https://ngageoint.github.io/seed/) image discovery

## Install
`npm install --save seed-images`

## Dependencies
* Angular 5
* [PrimeNG](https://www.primefaces.org/primeng/)
* [Font Awesome](http://fontawesome.io)
* [ClipboardJS](https://clipboardjs.com/)
* [JS-Beautify](https://github.com/beautify-web/js-beautify)
* [Lodash](https://lodash.com)

## Environment
The seed-images component expects two environment properties to be set:

* `scale`: In order for the component to properly display either the seed manifest JSON or a Scale import button, a `scale` property *must* be set in the project's environment object. The value should be `true` if seed-images is being used within a Scale UI.
* `siloUrl`: The URL of a valid [SILO](https://github.com/ngageoint/seed-silo) instance.

## How to use
* Import into app module: `import { SeedImagesModule } from 'seed-images';`
* `environment` (required): reference to an Angular environment object (see above).
* `imageImport`: event emitted when the "Import" button is clicked. Its payload is the image manifest JSON.

### environments/environment.ts
```
export const environment = {
  production: false,
  scale: false,
  siloUrl: 'http://mySiloApi.com'
};
```

### environments/environment.prod.ts
```
export const environment = {
  production: true,
  scale: false,
  siloUrl: 'http://mySiloApi.com'
};
```

### app.component.ts
```
import { Component } from '@angular/core';
import { environment } from '../environments/environment';
...
export class AppComponent {
  env = environment;
  constructor() {}
  
  // method to handle image import if scale environment var is true
  onImageImport(image) {
    console.log(image);
  }
  ...
}
```

### app.component.html
```
<seed-images [environment]="env"></seed-images>
```
or, if `scale: true`
```
<seed-images [environment]="env" (imageImport)="onImageImport($event)"></seed-images>
```
