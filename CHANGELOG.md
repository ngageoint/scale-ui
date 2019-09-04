# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.8.4](https://github.com/ngageoint/scale-ui/compare/v0.8.3...v0.8.4) (2019-09-03)


### Bug Fixes

* **metrics:** added logic to get metrics colors right ([ae8e93c](https://github.com/ngageoint/scale-ui/commit/ae8e93c))
* **recipe_types:** added check for job interface ([1bb27ef](https://github.com/ngageoint/scale-ui/commit/1bb27ef))



### [0.8.3](https://github.com/ngageoint/scale-ui/compare/v0.8.2...v0.8.3) (2019-09-03)


### Bug Fixes

* **dashboard:** removed ability to select more than one data feed ([9fc1573](https://github.com/ngageoint/scale-ui/commit/9fc1573))
* **job_types:** fixed rendering of job_types with no outputs ([d361783](https://github.com/ngageoint/scale-ui/commit/d361783))



### [0.8.2](https://github.com/ngageoint/scale-ui/compare/v0.8.1...v0.8.2) (2019-09-03)


### Bug Fixes

* **jobs:** fixed linting error ([b0f098d](https://github.com/ngageoint/scale-ui/commit/b0f098d))
* **stikes:** fixed action of saving strike ([65f9b35](https://github.com/ngageoint/scale-ui/commit/65f9b35))
* **workspaces:** removeed broker creds when no input provided ([a4ac5e8](https://github.com/ngageoint/scale-ui/commit/a4ac5e8))



### [0.8.1](https://github.com/ngageoint/scale-ui/compare/v0.8.0...v0.8.1) (2019-08-30)


### Bug Fixes

* **jobs:** added UI indication if job won't be retried ([5d7a43e](https://github.com/ngageoint/scale-ui/commit/5d7a43e))
* moved all save+validate functions to buttons ([596cb90](https://github.com/ngageoint/scale-ui/commit/596cb90))



## [0.8.0](https://github.com/ngageoint/scale-ui/compare/v0.7.0...v0.8.0) (2019-08-29)


### Bug Fixes

* **jobs:** corrected linting errors to allow for building ([52ff45c](https://github.com/ngageoint/scale-ui/commit/52ff45c))
* **strike:** corrected strike configuration payload ([adf998a](https://github.com/ngageoint/scale-ui/commit/adf998a))
* provide default values for environment variables ([02eb150](https://github.com/ngageoint/scale-ui/commit/02eb150))


### Features

* **jobs:** added requeue and cancel buttons to jobs page ([a6f86ef](https://github.com/ngageoint/scale-ui/commit/a6f86ef))



## [0.7.0](https://github.com/ngageoint/scale-ui/compare/v0.6.0...v0.7.0) (2019-08-20)


### Bug Fixes

* **nodes:** removed call to undefined object ([9fe0fa9](https://github.com/ngageoint/scale-ui/commit/9fe0fa9))
* **workspaces:** made host_path conditional on broker selection ([bbf363c](https://github.com/ngageoint/scale-ui/commit/bbf363c))
* corrected navbar responsiveness ([04c2728](https://github.com/ngageoint/scale-ui/commit/04c2728))
* improve datetime filtering across entire UI ([0bef666](https://github.com/ngageoint/scale-ui/commit/0bef666)), closes [#162](https://github.com/ngageoint/scale-ui/issues/162)
* **scheduler:**  correct scheduler pause payload and behavior ([a542078](https://github.com/ngageoint/scale-ui/commit/a542078))


### Features

* added page titles ([e0b6307](https://github.com/ngageoint/scale-ui/commit/e0b6307))



## [0.6.0](https://github.com/ngageoint/scale-ui/compare/v0.5.3...v0.6.0) (2019-08-02)


### Bug Fixes

* **build:** make all tests synchronous ([49117d9](https://github.com/ngageoint/scale-ui/commit/49117d9))
* **build:** make app component test synchronous ([4d3a927](https://github.com/ngageoint/scale-ui/commit/4d3a927))
* **nodes:** correct the object property for getting node status ([09ff21e](https://github.com/ngageoint/scale-ui/commit/09ff21e))
* **recipe types:** fix conditional nodes and other issues in recipe editor ([516be69](https://github.com/ngageoint/scale-ui/commit/516be69))


### Features

* **recipe types:** add additional editor controls ([3b138ee](https://github.com/ngageoint/scale-ui/commit/3b138ee))
* add ability to middle mouse click ui elements ([814dbe5](https://github.com/ngageoint/scale-ui/commit/814dbe5)), closes [#215](https://github.com/ngageoint/scale-ui/issues/215)
* **build:** add additional proxy entries for local API and test clusters ([faf28e8](https://github.com/ngageoint/scale-ui/commit/faf28e8))
* **job types:** add the ability to edit additional fields including docker_image and max_scheduled ([be1a939](https://github.com/ngageoint/scale-ui/commit/be1a939))
* **status:** add the ability to pause and resume the scheduler ([fa92502](https://github.com/ngageoint/scale-ui/commit/fa92502))



### [0.5.3](https://github.com-mil///compare/v0.5.2...v0.5.3) (2019-07-23)


### Bug Fixes

* **theme:** fix issues with displaying code while using the dark theme ([319ad04](https://github.com-mil///commit/319ad04))



### [0.5.2](https://github-mil///compare/v0.5.1...v0.5.2) (2019-07-18)


### Bug Fixes

* **build:** resolve issue with silo proxy failing when the silo backend is served over https ([299049b](https://github-mil///commit/299049b))
* **build:** update environment variables for consistency with Scale deployment ([61f30a9](https://github-mil///commit/61f30a9))
* update form labels for scans and strikes ([6618864](https://github-mil///commit/6618864))
* **dashboard:** remove deprecated job types from the dashboard ([ed301f7](https://github-mil///commit/ed301f7))
* **job types:** remove empty or null properties before posting a new job type to the API ([ab90a3e](https://github-mil///commit/ab90a3e))
* **recipe types:** adjust transform and text position of publisher job type nodes ([2547989](https://github-mil///commit/2547989))
* **scans:** initialize scan process on successful scan create/edit ([ef7a649](https://github-mil///commit/ef7a649))
* **strikes and scans:** remove required designation from optional fields ([a578a38](https://github-mil///commit/a578a38))



### [0.5.1](https://github.com-mil///compare/v0.5.0...v0.5.1) (2019-07-12)


### Bug Fixes

* **ingests:** add logic to properly handle null ingest fields so the ingest records table can display results without error ([5d683b6](https://github.com-mil///commit/5d683b6))
* **recipe types:** prevent misleading warning from showing while validating a new recipe type ([30aaa7a](https://github.com-mil///commit/30aaa7a))
* **scans:** bugfix so users can type in scan filter input; filter scans server side rather than client side ([3d0bcaa](https://github.com-mil///commit/3d0bcaa))
* **strikes:** remove unnecessary css styles that cause display issues when using the dark theme ([7d1acb9](https://github.com-mil///commit/7d1acb9))
* **strikes and scans:** modify duplicate methods for strikes and scans to retain necessary model information ([420d060](https://github.com-mil///commit/420d060))
* **workspaces:** prevent null value from being used for workspace description; remove required designation from base URL field ([678d4bd](https://github.com-mil///commit/678d4bd))



## [0.5.0](https://github.com-mil///compare/v0.4.3...v0.5.0) (2019-07-09)


### Bug Fixes

* **build:** Allow other forward proxies to determine protocol for API ([d558ad2](https://github.com-mil///commit/d558ad2))
* improve labeling and default options for some recipe type and strike form fields ([64ccfd0](https://github.com-mil///commit/64ccfd0))
* **metrics:** show selected color in color picker when the dark theme is ([5ad4a7f](https://github.com-mil///commit/5ad4a7f))
* reset page number when filtering datatables to prevent requesting a page that possibly does not exist ([088f151](https://github.com-mil///commit/088f151))
* **scans:** use correct link for the scan's job details ([4991cda](https://github.com-mil///commit/4991cda))
* **theme:** fix colors of seed image manifest and node toggle buttons for dark mode ([d2409f6](https://github.com-mil///commit/d2409f6))
* **workspaces:** remove required restriction from optional workspace fields ([23c0afe](https://github.com-mil///commit/23c0afe))


### Features

* **job types:** add the ability to edit job types ([05ef9b7](https://github.com-mil///commit/05ef9b7))
* **strikes:** add controls to cancel or requeue a strike ([03efd3f](https://github.com-mil///commit/03efd3f))



### [0.4.3](https://github.com-mil///compare/v0.4.2...v0.4.3) (2019-06-25)


### Bug Fixes

* **scans:** correct link to job details in scan details view ([644ae5c](https://github.com-mil///commit/644ae5c))
* **strikes:** remove required restriction on S3 secret access key field for strikes ([77e6cea](https://github.com-mil///commit/77e6cea))



### [0.4.2](https://github.com-mil///compare/v0.4.1...v0.4.2) (2019-06-25)


### Bug Fixes

* **workspaces:** remove required restriction for S3 workspace secret access key field ([8e374d5](https://github.com-mil///commit/8e374d5))



### [0.4.1](https://github-mil///compare/v0.4.0...v0.4.1) (2019-06-25)


### Bug Fixes

* **recipe types:** bugfix to enable recipe type inputs to be connected to nodes ([7b32ec2](https://github-mil///commit/7b32ec2))



## [0.4.0](https://github.com-mil///compare/v0.3.0...v0.4.0) (2019-06-25)


### Bug Fixes

* **data:** add check to make sure strikes are present in the system before trying to chart data feed performance ([29c1e8b](https://github.com-mil///commit/29c1e8b))
* **job types:** add warning if job or package version cannot be determined from seed image ([6f99f7e](https://github.com-mil///commit/6f99f7e))
* **job types:** check for existence of Seed Job Org value before building the job type docker_image property ([8769156](https://github.com-mil///commit/8769156))
* **job types:** use information from seed-images plugin to select the proper seed image job and package version ([19acef8](https://github.com-mil///commit/19acef8))
* **jobs:** change dark mode log text color to improve visibility ([9b5a8fc](https://github.com-mil///commit/9b5a8fc))
* **jobs:** disable sorting for jobs duration and log columns ([7677526](https://github.com-mil///commit/7677526))
* **navigation:** change scale logo fill to use primary scale color ([755ee64](https://github.com-mil///commit/755ee64))
* **recipe types:** remove media type restriction when mapping node inputs to dependency outputs ([8e36bf4](https://github.com-mil///commit/8e36bf4))


### Features

* **job types:** validate job type before pausing or unpausing ([0693bfd](https://github.com-mil///commit/0693bfd))
* **jobs:** add labels of selected jobs to job type filter in jobs table ([b412612](https://github.com-mil///commit/b412612))
* **metrics:** add color customization controls for metrics filters ([8cd7f23](https://github.com-mil///commit/8cd7f23))



## [0.3.0](https://github.com/ngageoint/scale-ui/compare/v0.2.0...v0.3.0) (2019-06-07)


### Bug Fixes

* correct color for sub navigation bar ([da49620](https://github.com/ngageoint/scale-ui/commit/da49620))
* **jobs:** remove invalid query parameters from job execution log API calls ([b69e405](https://github.com/ngageoint/scale-ui/commit/b69e405))


### Features

* add capability to set job type configuration properties when creating or editing a job type ([4ef471e](https://github.com/ngageoint/scale-ui/commit/4ef471e))
* add indicator for required form inputs ([43bec5c](https://github.com/ngageoint/scale-ui/commit/43bec5c))
* **metrics:** add recipe type dropdown to metrics filters that automatically selects all job types it represents for inclusion in the metrics chart ([ca963eb](https://github.com/ngageoint/scale-ui/commit/ca963eb))



## [0.2.0](https://github.com/ngageoint/scale-ui/compare/v0.1.0...v0.2.0) (2019-06-03)


### Bug Fixes

* fix broken job detail link in strike detail view ([e314e63](https://github.com/ngageoint/scale-ui/commit/e314e63))


### Features

* add timeline chart ([9766cd3](https://github.com/ngageoint/scale-ui/commit/9766cd3))



## [0.1.0](https://github-mil///compare/v0.0.0...v0.1.0) (2019-05-28)


### Features

* add documentation link and ui version to footer ([35c3dc7](https://github-mil///commit/35c3dc7))



## 0.0.0 (2019-05-28)
