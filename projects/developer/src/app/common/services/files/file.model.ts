export class FileModel {

    private static build(data) {
        if (data) {
            return new FileModel(
                data.id,
                data.name,
                data.version,
                data.title,
                data.description,
                data.icon_code,
                data.is_published,
                data.is_active,
                data.is_paused,
                data.is_system,
                data.max_scheduled,
                data.max_tries,
                data.revision_num,
                data.docker_image,
                data.unmet_resources,
                data.manifest,
                data.configuration,
                data.created,
                data.deprecated,
                data.paused,
                data.last_modified
            );
        }
    }

    public static initialJobType(data) {
        return {
            icon_code: data.icon_code || null,
            docker_image: data.docker_image || null,
            manifest: data.manifest || null,
            configuration: data.configuration || {
                output_workspaces: {
                    default: '',
                    outputs: {}
                },
                mounts: {},
                settings: {}
            }
        };
    }

    public static transformer(data) {
        if (data) {
            return FileModel.build(data);
        }
        return new FileModel();
    }

    constructor(
        public id?: number,
        public workspace?: any,
        public file_name?: string,
        public media_type?: string,
        public file_size?: any,
        public is_deleted?: boolean,
        public url?: string,
        public created?: string,
        public deleted?: any,
        public data_started?: string,
        public data_ended?: string,
        public geometry?: any,
        public center_point?: any,
        public countries?: string[],
        public last_modified?: string,
        public file_path?: string,
        public source_started?: string,
        public source_ended?: string,
        public source_sensor?: any,
        public source_collection?: any,
        public source_task?: string,
        public job?: any,
        public job_exe?: any,
        public job_output?: string,
        public job_type?: any,
        public recipe?: any,
        public recipe_node?: string,
        public recipe_type?: any,
        public batch?: any,
        public is_superseded?: boolean,
        public superseded?: any,
    ) {
        this.id = this.id || null;
        this.workspace = this.workspace || null;
        this.file_name = this.file_name || null;
        this.media_type = this.media_type || null;
        this.file_size = this.file_size || null;
        this.is_deleted = this.is_deleted || null;
        this.url = this.url || null;
        this.created = this.created || null;
        this.deleted = this.deleted || null;
        this.data_started = this.data_started || null;
        this.data_ended = this.data_ended || null;
        this.geometry = this.geometry || null;
        this.center_point = this.center_point || null;
        this.countries = this.countries || null;
        this.last_modified = this.last_modified || null;
        this.file_path = this.file_path || null;
        this.source_started = this.source_started || null;
        this.source_ended = this.source_ended || null;
        this.source_sensor = this.source_sensor || null;
        this.source_collection = this.source_collection || null;
        this.source_task = this.source_task || null;
        this.job = this.job || null;
        this.job_exe = this.job_exe || null;
        this.job_output = this.job_output || null;
        this.job_type = this.job_type || null;
        this.recipe = this.recipe || null;
        this.recipe_node = this.recipe_node || null;
        this.recipe_type = this.recipe_type || null;
        this.batch = this.batch || null;
        this.is_superseded = this.is_superseded || null;
        this.superseded = this.superseded || null;
    }
}

