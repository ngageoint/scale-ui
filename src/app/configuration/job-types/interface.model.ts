export class JobTypeInterface {
    constructor(
        public command: string,
        public command_arguments?: string,
        public version?: string,
        public env_vars?: object[],
        public mounts?: object[],
        public settings?: object[],
        public input_data?: object[],
        public output_data?: object[]
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
