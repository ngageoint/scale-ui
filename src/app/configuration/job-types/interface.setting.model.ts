export class InterfaceSetting {
    constructor(
        public name: string,
        public required?: boolean,
        public secret?: boolean
    ) {
        this.name = this.name || null;
        this.required = this.required || null;
        this.secret = this.secret || null;
    }
}
