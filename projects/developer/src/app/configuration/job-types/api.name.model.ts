export class JobTypeName {
    private static build(data) {
        if (data) {
            return new JobTypeName(
                data.id,
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
        public id: number,
        public name: string,
        public title: string,
        public description: string,
        public icon_code: string,
        public num_versions: number,
        public latest_version: string
    ) {}
}
