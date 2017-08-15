export class InterfaceOutput {
    constructor(
        public name: string,
        public type: string,
        public required?: boolean,
        public media_types?: string[]
    ) {
        this.name = this.name || null;
        this.type = this.type || null;
        this.required = this.required || null;
        this.media_types = this.media_types || null;
    }
}
