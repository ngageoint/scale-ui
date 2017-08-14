export class InterfaceMount {
    constructor(
        public name: string,
        public path: string,
        public required?: boolean,
        public mode?: string
    ) {
        this.name = this.name || null;
        this.path = this.path || null;
        this.required = this.required || true;
        this.mode = this.mode || 'ro';
    }
}
