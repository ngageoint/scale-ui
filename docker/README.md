# Scale UI Docker

We package the Scale UI assets into Docker along with nginx reverse proxy entries to support both external (Marathon LB) and internal (DCOS Admin Router) access to both API and static content. Angular routing makes this quite difficult, so we offload the complexity by just duplication and shimming of the assets within the nginx web root. The result is a copy of the UI assets for each unique context - commonly this is at `/` and `/service/scale` to support both external and internal access.

As a result the following environment settings are used to configure the runtime behavior of the UI:

* API_BACKEND: URL to the Scale API backend. Allows the API to be accessed without CORS issues. (default: `http://scale-webserver.marathon.l4lb.thisdcos.directory:80/`)
* API_PREFIX: API prefix for the UI to issue API calls.  Should only be overridden for an externally hosted Scale API. (default: `/api`)
* AUTH_URL: Authentication URL for redirect when login cookie is missing. (default: `/api/login`)
* AUTH_ENABLED: Is backend authentication required. (default: `true`)
* SILO_URL: Silo API for discovery and import of Seed compliant images. (default: `/silo`)
* SILO_BACKEND: URL to the Silo API backend. Allows the API to be accessed from UI without CORS issues. (default: `http://scale-silo.marathon.l4lb.thisdcos.directory:9000/`)

