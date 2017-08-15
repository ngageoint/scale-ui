import { InterfaceInput } from './interface.input.model';
import { InterfaceSetting } from './interface.setting.model';
import { InterfaceMount } from './interface.mount.model';
import { InterfaceEnvVar } from './interface.envvar.model';

export class JobTypeInterface {
    constructor(
        public command: string,
        public command_arguments?: string,
        public version?: string,
        public env_vars?: InterfaceEnvVar[],
        public mounts?: InterfaceMount[],
        public settings?: InterfaceSetting[],
        public input_data?: InterfaceInput[],
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
