class Broker {
    private static build(data) {
        if (data) {
            return new Broker(
                data.type,
                data.host_path,
                data.nfs_path,
                data.bucket_name,
                data.credentials,
                data.region_name
            );
        }
    }

    public static transformer(data) {
        if (data) {
            return Broker.build(data);
        }
        return new Broker('', '', '', '', '', '');
    }

    constructor(
        public type: string,
        public host_path: string,
        public nfs_path: string,
        public bucket_name: string,
        public credentials: any,
        public region_name: string
    ) {}
}

export class WorkspaceConfiguration {
    private static build(data) {
        if (data) {
            return new WorkspaceConfiguration(
                data.broker
            );
        }
    }

    public static transformer(data) {
        if (data) {
            return WorkspaceConfiguration.build(data);
        }
        return new WorkspaceConfiguration(Broker.transformer(null));
    }

    constructor(
        public broker: Broker
    ) {}
}
