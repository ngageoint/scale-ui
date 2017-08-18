import { JobTypeInterface } from './interface.model';
import { Trigger } from './trigger.model';
import { ErrorMapping } from './error.mapping.model';
import { CustomResources } from './custom.resources.model';

export class JobType {
    constructor(
        public name: string,
        public version: string,
        public job_type_interface: JobTypeInterface, // api model property is just 'interface'
        public title?: string,
        public id?: number,
        public description?: string,
        public category?: string,
        public author_name?: string,
        public author_url?: string,
        public is_system?: boolean,
        public is_long_running?: boolean,
        public is_active?: boolean,
        public is_operational?: boolean,
        public is_paused?: boolean,
        public icon_code?: string,
        public uses_docker?: boolean,
        public docker_image?: string,
        public revision_num?: number,
        public priority?: number,
        public timeout?: number,
        public max_scheduled?: number,
        public max_tries?: number,
        public cpus_required?: number,
        public mem_required?: number,
        public mem_const_required?: number,
        public mem_mult_required?: number,
        public shared_mem_required?: number,
        public disk_out_const_required?: number,
        public disk_out_mult_required?: number,
        public created?: string,
        public archived?: string,
        public paused?: string,
        public last_modified?: string,
        public custom_resources?: CustomResources,
        public error_mapping?: ErrorMapping,
        public trigger_rule?: Trigger,
        public errors?: object[],
        public job_counts_6h?: object[],
        public job_counts_12h?: object[],
        public job_counts_24h?: object[]
    ) {
        this.name = this.name || null;
        this.version = this.version || null;
        this.job_type_interface = this.job_type_interface || null;
        this.title = this.title || null;
        this.id = this.id || null;
        this.description = this.description || null;
        this.category = this.category || null;
        this.author_name = this.author_name || null;
        this.author_url = this.author_url || null;
        this.is_system = this.is_system || null;
        this.is_long_running = this.is_long_running || null;
        this.is_active = this.is_active || null;
        this.is_operational = this.is_operational || null;
        this.is_paused = this.is_paused || null;
        this.icon_code = this.icon_code || null;
        this.uses_docker = this.uses_docker || null;
        this.docker_image = this.docker_image || null;
        this.revision_num = this.revision_num || null;
        this.priority = this.priority || null;
        this.timeout = this.timeout || null;
        this.max_scheduled = this.max_scheduled || null;
        this.max_tries = this.max_tries || null;
        this.cpus_required = this.cpus_required || null;
        this.mem_required = this.mem_required || null;
        this.mem_const_required = this.mem_const_required || null;
        this.mem_mult_required = this.mem_mult_required || null;
        this.shared_mem_required = this.shared_mem_required || null;
        this.disk_out_const_required = this.disk_out_const_required || null;
        this.disk_out_mult_required = this.disk_out_mult_required || null;
        this.created = this.created || null;
        this.archived = this.archived || null;
        this.paused = this.paused || null;
        this.last_modified = this.last_modified || null;
        this.custom_resources = this.custom_resources || new CustomResources();
        this.error_mapping = this.error_mapping || new ErrorMapping();
        this.trigger_rule = this.trigger_rule || null;
        this.errors = this.errors || null;
        this.job_counts_6h = this.job_counts_6h || null;
        this.job_counts_12h = this.job_counts_12h || null;
        this.job_counts_24h = this.job_counts_24h || null;
    }
}
