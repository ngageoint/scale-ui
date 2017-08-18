export class ErrorMapping {
    constructor(
        public version?: string,
        public exit_codes?: object
    ) {
        this.version = this.version || '';
        this.exit_codes = this.exit_codes || {};
    }
}
