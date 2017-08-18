export class CustomResources {
    constructor(
        public version?: string,
        public resources?: object
    ) {
        this.version = this.version || '';
        this.resources = this.resources || {};
    }
}
