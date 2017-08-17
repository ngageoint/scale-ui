export class InterfaceEnvVar {
    constructor(
        public name: string,
        public value: string
    ) {
        this.name = this.name || null;
        this.value = this.value || null;
    }
}

export class InterfaceMount {
    constructor(
        public name: string,
        public path: string,
        public required?: boolean,
        public mode?: string
    ) {}
}

export class InterfaceSetting {
    constructor(
        public name: string,
        public required?: boolean,
        public secret?: boolean
    ) {}
}

export class InterfaceInput {
    constructor(
        public name: string,
        public type: string,
        public required?: boolean,
        public partial?: boolean,
        public media_types?: string[]
    ) {}
}

export class InterfaceOutput {
    constructor(
        public name: string,
        public type: string,
        public required?: boolean,
        public media_types?: string[]
    ) {}
}

export class JobTypeInterface {
    constructor(
        public command: string,
        public command_arguments?: string,
        public version?: string,
        public env_vars?: InterfaceEnvVar[],
        public mounts?: InterfaceMount[],
        public settings?: InterfaceSetting[],
        public input_data?: InterfaceInput[],
        public output_data?: InterfaceOutput[]
    ) {
        this.version = this.version || null;
        this.command = this.command || null;
        this.command_arguments = this.command_arguments || '';
        this.env_vars = this.env_vars || [];
        this.mounts = this.mounts || [];
        this.settings = this.settings || [];
        this.input_data = this.input_data || [];
        this.output_data = this.output_data || [];
    }
}
