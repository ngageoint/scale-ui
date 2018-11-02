export class JobTypeName {
    private static build(data) {
        if (data) {
            return new JobTypeName(
                data.name,
                data.title,
                data.description,
                data.icon_code,
                data.num_versions,
                data.latest_version
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => JobTypeName.build(item));
            }
            return JobTypeName.build(data);
        }
        return null;
    }
    constructor(
        public name?: string,
        public title?: string,
        public description?: string,
        public icon_code?: string,
        public num_versions?: number,
        public latest_version?: string
    ) {
        this.name = this.name || null;
        this.title = this.title || null;
        this.description = this.description || null;
        this.icon_code = this.icon_code || null;
        this.num_versions = this.num_versions || null;
        this.latest_version = this.latest_version || null;
    }
}
