export class SourceFile {
    constructor(
        public id: number,
        public workspace: any,
        public file_name: string,
        public media_type: string,
        public file_size: number,
        public data_type: string[],
        public is_deleted: boolean,
        public uuid: string,
        public url: string,
        public created: string,
        public deleted: string,
        public data_started: string,
        public data_ended: string,
        public geometry: string,
        public center_point: string,
        public meta_data: object,
        public countries: string[],
        public last_modified: string,
        public is_parsed: boolean,
        public parsed: string
    ) {}
}
