export class StrikeIngestFile {
    private static build(data) {
        if (data) {
            return new StrikeIngestFile(
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
                return data.map(item => StrikeIngestFile.build(item));
            }
            return StrikeIngestFile.build(data);
        }
        return new StrikeIngestFile('', [], '', '');
    }
    constructor(
        public filename_regex: string,
        public data_types: any,
        public new_workspace: string,
        public new_file_path: string
    ) {}
}
