# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
