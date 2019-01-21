export class Workspace {
    private static build(data) {
        if (data) {
            return new Workspace(
                data.id,
                data.name,
                data.title,
                data.description,
                data.base_url,
                data.is_active,
                data.created,
                data.deprecated,
                data.last_modified,
                data.json_config
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Workspace.build(item));
            }
            return Workspace.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public name: string,
        public title: string,
        public description: string,
        public base_url: string,
        public is_active: boolean,
        public created: string,
        public deprecated: string,
        public last_modified: string,
        public json_config: object
    ) {}
}

