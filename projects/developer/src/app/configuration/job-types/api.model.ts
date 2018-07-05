export class JobType {
    private static build(data) {
        if (data) {
            return new JobType(
                data.manifest,
                data.id,
                data.timeout,
                data.category,
                data.is_system,
                data.is_active,
                data.is_operational,
                data.is_paused,
                data.icon_code,
                data.docker_image,
                data.revision_num,
                data.priority,
                data.max_scheduled,
                data.max_tries,
                data.created,
                data.archived,
                data.paused,
                data.last_modified,
                data.job_counts_6h,
                data.job_counts_12h,
                data.job_counts_24h
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => JobType.build(item));
            }
            return JobType.build(data);
        }
        return null;
    }
    constructor(
        public manifest: any,
        public id?: number,
        public timeout?: any,
        public category?: string,
        public is_system?: boolean,
        public is_active?: boolean,
        public is_operational?: boolean,
        public is_paused?: boolean,
        public icon_code?: string,
        public docker_image?: string,
        public revision_num?: number,
        public priority?: number,
        public max_scheduled?: number,
        public max_tries?: number,
        public created?: string,
        public archived?: string,
        public paused?: string,
        public last_modified?: string,
        public job_counts_6h?: object[],
        public job_counts_12h?: object[],
        public job_counts_24h?: object[]
    ) {
        this.manifest = this.manifest || null;
        this.id = this.id || null;
        this.category = this.category || null;
        this.is_system = this.is_system || null;
        this.is_active = this.is_active || null;
        this.is_operational = this.is_operational || null;
        this.is_paused = this.is_paused || null;
        this.icon_code = this.icon_code || null;
        this.docker_image = this.docker_image || null;
        this.revision_num = this.revision_num || null;
        this.priority = this.priority || null;
        this.max_scheduled = this.max_scheduled || null;
        this.max_tries = this.max_tries || null;
        this.created = this.created || null;
        this.archived = this.archived || null;
        this.paused = this.paused || null;
        this.last_modified = this.last_modified || null;
        this.job_counts_6h = this.job_counts_6h || null;
        this.job_counts_12h = this.job_counts_12h || null;
        this.job_counts_24h = this.job_counts_24h || null;
    }
}
