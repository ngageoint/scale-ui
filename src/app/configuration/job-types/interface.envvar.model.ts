export class InterfaceEnvVar {
    constructor(
        public name: string,
        public value: string
    ) {
        this.name = this.name || null;
        this.value = this.value || null;
    }
}
