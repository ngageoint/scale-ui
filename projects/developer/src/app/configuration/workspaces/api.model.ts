export class Workspace {
    constructor(
        public id: number,
        public name: string,
        public title: string,
        public description: string,
        public base_url: string,
        public is_active: boolean,
        public used_size: number,
        public total_size: number,
        public created: string,
        public archived: string,
        public last_modified: string,
        public json_config: object
    ) {}
}
