export class InterfaceInput {
    constructor(
        public name: string,
        public type: string,
        public required?: boolean,
        public partial?: boolean,
        public media_types?: string[]
    ) {}
}
