export class Node {
    pauseLabel: string;
    pauseIcon: string;
    deprecateLabel: string;
    deprecateIcon: string;
    headerClass: string;
    private static build(data) {
        if (data) {
            return new Node(
                data.id,
                data.hostname,
                data.is_paused,
                data.is_active,
                data.deprecated,
                data.created,
                data.last_modified
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Node.build(item));
            }
            return Node.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public hostname: string,
        public is_paused: boolean,
        public is_active: boolean,
        public deprecated: string,
        public created: string,
        public last_modified: string,
    ) {
        this.pauseLabel = this.is_paused ? 'Resume' : 'Pause';
        this.pauseIcon = this.is_paused ? 'fa fa-play' : 'fa fa-pause';
        this.deprecateLabel = this.is_active ? 'Deprecate' : 'Activate';
        this.deprecateIcon = this.is_active ? 'fa fa-toggle-on' : 'fa fa-toggle-off';
        this.headerClass = this.is_paused ? 'node__paused' : '';
    }
}
