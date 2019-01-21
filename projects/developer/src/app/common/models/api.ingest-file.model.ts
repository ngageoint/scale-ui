export class IngestFile {
    private static build(data) {
        if (data) {
            return new IngestFile(
                data.filename_regex,
                data.data_types,
                data.new_workspace,
                data.new_file_path
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => IngestFile.build(item));
            }
            return IngestFile.build(data);
        }
        return new IngestFile('', [], '', '');
    }
    constructor(
        public filename_regex: string,
        public data_types: any,
        public new_workspace: string,
        public new_file_path: string
    ) {}
}
